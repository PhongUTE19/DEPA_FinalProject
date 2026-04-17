import { PaymentService } from '../services/payment/PaymentService.js';
import { OrderService } from '../services/order/OrderService.js';
import { CartService } from '../services/cart/CartService.js';
import { CouponService } from '../services/coupon/CouponService.js';

const PaymentController = {

    // GET /payment/:orderId — trang chọn phương thức thanh toán (SSR)
    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const methods = PaymentService.getAvailableMethods();

            // Kiểm tra đơn đã thanh toán chưa
            const existing = await PaymentService.getByOrderId(orderId);

            // Lấy thông tin đơn hàng để hiển thị tổng tiền & danh sách món
            const order = await OrderService.getOrder(orderId);
            const orderData = order.toJSON();

            // Lấy mã giảm giá khả dụng
            const coupons = await CouponService.getAvailableCoupons();
            const availableCoupons = coupons.map(c => ({
                code: c.code,
                discountType: c.discountType,
                discountValue: c.discountValue,
                discountAmount: c.calculateDiscount(orderData.totalAmount),
            }));

            return res.render('pages/payment/index', {
                title: 'Thanh toán đơn hàng',
                orderId,
                methods,
                totalAmount: orderData.totalAmount,
                orderItems: orderData.items,
                userId: req.session?.authUser?.id,
                alreadyPaid: existing?.isSuccess() ?? false,
                payment: existing?.toJSON() ?? null,
                availableCoupons: availableCoupons || [],
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment — submit form thanh toán (SSR)
    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, couponCode } = req.body;
            const userId = req.session?.authUser?.id ?? null;

            // 1. Fetch order để recalculate totalAmount (không tin client)
            const order = await OrderService.getOrder(orderId);
            const orderData = order.toJSON();
            let finalAmount = orderData.totalAmount;

            // 2. Nếu có coupon code, validate & apply lại
            if (couponCode) {
                const coupon = await CouponService.findByCode(couponCode);
                if (!coupon) {
                    throw new Error('Mã giảm giá không tồn tại');
                }
                const { valid, reason } = coupon.isValid(orderData.totalAmount);
                if (!valid) {
                    throw new Error(reason);
                }
                const discount = coupon.calculateDiscount(orderData.totalAmount);
                finalAmount = orderData.totalAmount - discount;
            }

            const payment = await PaymentService.processPayment({ orderId, paymentMethod, userId, totalAmount: finalAmount, couponCode });

            if (!payment.isSuccess()) {
                return res.render('pages/payment/result', {
                    title: 'Thanh toán thất bại',
                    success: false,
                    message: payment.failureReason || 'Thanh toán thất bại',
                });
            }

            // Thanh toán thành công → xoá giỏ hàng
            if (req.session) {
                CartService.clearCart(req.session);
                delete req.session.pendingOrderId;
            }

            return res.render('pages/payment/result', {
                title: 'Thanh toán thành công',
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

    // GET /payment/history — lịch sử thanh toán (SSR) → redirect to /order
    async showPaymentHistoryPage(req, res, next) {
        return res.redirect('/order');
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

            const userId = req.body.userId ?? req.session?.authUser?.id ?? null;
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
            if (msg === 'Order not found') return res.status(404).json({ success: false, message: msg });
            if (msg === 'Order already paid') return res.status(409).json({ success: false, message: msg });
            next(err);
        }
    },
};

export default PaymentController;
