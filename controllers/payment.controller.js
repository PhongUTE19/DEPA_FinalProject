import { PaymentService } from '../services/payment/PaymentService.js';

const PaymentController = {

    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);

            const methods = PaymentService.getAvailableMethods();

            res.render('payment/index', {
                title: 'Thanh toán đơn hàng',
                orderId,
                methods,
                userId
            });
        } catch (err) {
            next(err);
        }
    },

    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, userId } = req.body;

            const payment = await PaymentService.processPayment({
                orderId,
                paymentMethod,
                userId: userId || req.session?.authUser?.id
            });

            if (!payment.isSuccess()) {
                return res.render('payment/result', {
                    title: 'Thanh toán thất bại',
                    success: false,
                    message: 'Thanh toán thất bại'
                });
            }

            res.render('payment/result', {
                title: 'Thanh toán thành công',
                success: true,
                payment: payment.toJSON()
            });

        } catch (err) {
            if (err.message === 'Order not found') {
                return res.render('payment/result', {
                    title: 'Thanh toán thất bại',
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            if (err.message === 'Order already paid') {
                return res.render('payment/result', {
                    title: 'Đơn hàng đã thanh toán',
                    success: false,
                    message: 'Đơn hàng đã được thanh toán trước đó'
                });
            }

            console.error(err);
            next(err);
        }
    },

    async paymentHistory(req, res, next) {
        try {
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
            const payments = await PaymentService.getPaymentHistory(userId);

            res.render('payment/history', {
                title: 'Lịch sử thanh toán',
                payments: payments.map(p => p.toJSON())
            });
        } catch (err) {
            next(err);
        }
    },

    // ================= API =================

    async apiProcessPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, userId } = req.body;

            if (!orderId || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu orderId hoặc paymentMethod'
                });
            }

            const payment = await PaymentService.processPayment({
                orderId,
                paymentMethod,
                userId
            });

            if (!payment.isSuccess()) {
                return res.status(402).json({
                    success: false,
                    message: 'Thanh toán thất bại'
                });
            }

            res.json({
                success: true,
                payment: payment.toJSON()
            });

        } catch (err) {
            if (err.message === 'Order not found') {
                return res.status(404).json({ success: false, message: err.message });
            }

            if (err.message === 'Order already paid') {
                return res.status(409).json({ success: false, message: err.message });
            }

            console.error(err);
            next(err);
        }
    }
};

export default PaymentController;