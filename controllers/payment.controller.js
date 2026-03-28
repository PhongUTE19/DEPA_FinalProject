﻿import { PaymentAdapter } from '../services/payment/PaymentAdapter.js';
import PaymentModel from '../models/payment.model.js';
import orderSubject from '../services/notification/OrderSubject.js';

const PaymentController = {
    // GET /payment/:orderId — Payment page
    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);

            // Check if already paid
            const existing = await PaymentModel.findByOrderId(Number(orderId));
            if (existing) {
                return res.render('payment/result', {
                    title: 'Payment Result',
                    payment: existing,
                    alreadyPaid: true,
                });
            }

            const methods = PaymentAdapter.getAvailableMethods();

            res.render('payment/index', {
                title: 'Order Payment',
                orderId,
                methods,
                userId,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment — Process payment
    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, totalAmount, userId } = req.body;

            // 1. Call PaymentAdapter (uses Strategy Pattern internally)
            const result = await PaymentAdapter.process(paymentMethod, { orderId: Number(orderId),
                totalAmount,
                userId,
            });

            if (!result.success) {
                return res.render('payment/result', {
                    title: 'Payment Failed',
                    success: false,
                    message: result.message,
                });
            }

            // 2. Save to DB
            const payment = await PaymentModel.create({ orderId: Number(orderId),
                userId: userId || req.session?.authUser?.id,
                method: result.method,
                transactionId: result.transactionId,
                amount: Number(result.amount || totalAmount || 0),
                status: 'success',
            });

            // 3. Notify Observers (UserNotifier + KitchenNotifier)
            orderSubject.notify('ORDER_PAID', {
                orderId,
                userId: payment.user_id,
                transactionId: result.transactionId,
                amount: Number(result.amount || totalAmount || 0),
            });

            res.render('payment/result', {
                title: 'Payment Successful',
                success: true,
                payment,
                result,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /payment/history — Payment history
    async paymentHistory(req, res, next) {
        try {
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
            const payments = await PaymentModel.findByUserId(userId);

            res.render('payment/history', {
                title: 'Payment History',
                payments,
            });
        } catch (err) {
            next(err);
        }
    },

    // ===================================================
    // API Endpoints (JSON)
    // ===================================================

    // POST /api/payment
    async apiProcessPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, totalAmount, userId } = req.body;

            if (!orderId || !paymentMethod || !totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing info: orderId, paymentMethod, totalAmount',
                });
            }

            const result = await PaymentAdapter.process(paymentMethod, { orderId: Number(orderId),
                totalAmount,
                userId,
            });

            if (!result.success) {
                return res.status(402).json({ success: false, message: result.message });
            }

            const payment = await PaymentModel.create({ orderId: Number(orderId),
                userId,
                method: result.method,
                transactionId: result.transactionId,
                amount: Number(result.amount || totalAmount || 0),
                status: 'success',
            });

            orderSubject.notify('ORDER_PAID', {
                orderId,
                userId,
                transactionId: result.transactionId,
                amount: Number(result.amount || totalAmount || 0),
            });

            res.json({ success: true, payment, result });
        } catch (err) {
            next(err);
        }
    },
};

export default PaymentController;
