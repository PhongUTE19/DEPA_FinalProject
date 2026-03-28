import { PaymentAdapter } from '../services/payment/PaymentAdapter.js';
import PaymentModel from '../models/payment.model.js';
import orderSubject from '../services/notification/OrderSubject.js';

const PaymentController = {
    // GET /payment/:orderId â€” Trang thanh toÃ¡n
    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);

            // Kiá»ƒm tra Ä‘Ã£ thanh toÃ¡n chÆ°a
            const existing = await PaymentModel.findByOrderId(Number(orderId));
            if (existing) {
                return res.render('payment/result', {
                    title: 'Káº¿t quáº£ thanh toÃ¡n',
                    payment: existing,
                    alreadyPaid: true,
                });
            }

            const methods = PaymentAdapter.getAvailableMethods();

            res.render('payment/index', {
                title: 'Thanh toÃ¡n Ä‘Æ¡n hÃ ng',
                orderId,
                methods,
                userId,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment â€” Xá»­ lÃ½ thanh toÃ¡n
    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, totalAmount, userId } = req.body;

            // 1. Gá»i PaymentAdapter (bÃªn trong dÃ¹ng Strategy Pattern)
            const result = await PaymentAdapter.process(paymentMethod, { orderId: Number(orderId),
                totalAmount,
                userId,
            });

            if (!result.success) {
                return res.render('payment/result', {
                    title: 'Thanh toÃ¡n tháº¥t báº¡i',
                    success: false,
                    message: result.message,
                });
            }

            // 2. LÆ°u vÃ o DB
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
                title: 'Thanh toÃ¡n thÃ nh cÃ´ng',
                success: true,
                payment,
                result,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /payment/history â€” Lá»‹ch sá»­ thanh toÃ¡n
    async paymentHistory(req, res, next) {
        try {
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
            const payments = await PaymentModel.findByUserId(userId);

            res.render('payment/history', {
                title: 'Lá»‹ch sá»­ thanh toÃ¡n',
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
                    message: 'Thiáº¿u thÃ´ng tin: orderId, paymentMethod, totalAmount',
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



