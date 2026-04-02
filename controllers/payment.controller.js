/**
 * PaymentController
 *
 * Chỉ nhận req → gọi PaymentService → gọi .toJSON() → trả res.
 * KHÔNG import PaymentModel, Payment, PaymentAdapter trực tiếp.
 */
import { PaymentService } from '../services/payment/PaymentService.js';

const PaymentController = {

    // GET /payment/:orderId — trang chọn phương thức thanh toán (SSR)
    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const methods     = PaymentService.getAvailableMethods();

            // Kiểm tra đơn đã thanh toán chưa
            const existing = await PaymentService.getByOrderId(orderId);

            return res.render('pages/payment/index', {
                title:    'Thanh toán đơn hàng',
                orderId,
                methods,
                alreadyPaid: existing?.isSuccess() ?? false,
                payment:     existing?.toJSON() ?? null,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment — submit form thanh toán (SSR)
    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod } = req.body;
            const userId = req.session?.authUser?.id ?? null;

            const payment = await PaymentService.processPayment({ orderId, paymentMethod, userId });

            if (!payment.isSuccess()) {
                return res.render('pages/payment/result', {
                    title:   'Thanh toán thất bại',
                    success: false,
                    message: payment.failureReason || 'Thanh toán thất bại',
                });
            }

            return res.render('pages/payment/result', {
                title:   'Thanh toán thành công',
                success: true,
                payment: payment.toJSON(),
            });
        } catch (err) {
            const msg = err.message;
            if (msg === 'Order not found') {
                return res.render('pages/payment/result', {
                    title: 'Lỗi', success: false, message: 'Không tìm thấy đơn hàng',
                });
            }
            if (msg === 'Order already paid') {
                return res.render('pages/payment/result', {
                    title: 'Đã thanh toán', success: false, message: 'Đơn hàng đã được thanh toán trước đó',
                });
            }
            next(err);
        }
    },

    // GET /payment/history — lịch sử thanh toán (SSR)
    async showPaymentHistoryPage(req, res, next) {
        try {
            const userId   = req.session?.authUser?.id ?? null;
            if (!userId) return res.redirect('/account/signin');

            const payments = await PaymentService.getPaymentHistory(userId);
            return res.render('pages/payment/history', {
                title:    'Lịch sử thanh toán',
                payments: payments.map(p => p.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment/api — JSON API thanh toán
    async apiProcessPayment(req, res, next) {
        try {
            const { orderId, paymentMethod } = req.body;
            if (!orderId || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu orderId hoặc paymentMethod',
                });
            }

            const userId  = req.body.userId ?? req.session?.authUser?.id ?? null;
            const payment = await PaymentService.processPayment({ orderId, paymentMethod, userId });

            if (!payment.isSuccess()) {
                return res.status(402).json({
                    success: false,
                    message: payment.failureReason || 'Thanh toán thất bại',
                });
            }

            return res.json({ success: true, payment: payment.toJSON() });
        } catch (err) {
            const msg = err.message;
            if (msg === 'Order not found')  return res.status(404).json({ success: false, message: msg });
            if (msg === 'Order already paid') return res.status(409).json({ success: false, message: msg });
            next(err);
        }
    },
};

export default PaymentController;
