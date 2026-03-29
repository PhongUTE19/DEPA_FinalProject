import { PaymentAdapter } from '../services/payment/PaymentAdapter.js';
import PaymentModel from '../models/payment.model.js';
import OrderModel from '../models/order.model.js';
import orderSubject from '../services/notification/OrderSubject.js';

const PaymentController = {
    // GET /payment/:orderId – Trang thanh toán
    async showPaymentPage(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);

            // Kiểm tra đã thanh toán chưa
            const existing = await PaymentModel.findByOrderId(orderId);
            if (existing) {
                return res.render('payment/result', {
                    title: 'Kết quả thanh toán',
                    payment: existing,
                    alreadyPaid: true,
                });
            }

            // Lấy thông tin đơn hàng từ DB
            const dbOrder = await OrderModel.findById(orderId);
            const totalAmount = dbOrder?.total_amount || 0;

            const methods = PaymentAdapter.getAvailableMethods();

            res.render('payment/index', {
                title: 'Thanh toán đơn hàng',
                orderId,
                methods,
                userId,
                totalAmount,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /payment – Xử lý thanh toán
    async processPayment(req, res, next) {
        try {
            const { orderId, paymentMethod, totalAmount, userId } = req.body;

            // 0) Validate: tồn tại đơn + trạng thái cho phép + chưa thanh toán
            const dbOrder = await OrderModel.findById(orderId);
            if (!dbOrder) {
                return res.render('payment/result', {
                    title: 'Thanh toán thất bại', success: false, message: 'Không tìm thấy đơn hàng.'
                });
            }
            const status = String(dbOrder.status || '').toLowerCase();
            const blockedStatuses = new Set(['completed', 'done', 'paid', 'cancelled', 'canceled']);
            if (blockedStatuses.has(status)) {
                return res.render('payment/result', {
                    title: 'Thanh toán không hợp lệ', success: false,
                    message: `Đơn hàng đã ở trạng thái '${dbOrder.status}', không thể thanh toán.`,
                });
            }
            const existing = await PaymentModel.findByOrderId(orderId);
            if (existing) {
                return res.render('payment/result', {
                    title: 'Kết quả thanh toán', payment: existing, alreadyPaid: true,
                });
            }

            // 1) Lấy tổng tiền: nếu form không điền, đọc từ DB.orders
            let amountToPay = Number(totalAmount || 0);
            if (!amountToPay) amountToPay = Number(dbOrder.total_amount || 0);

            if (!amountToPay) {
                return res.render('payment/result', {
                    title: 'Thanh toán thất bại', success: false, message: 'Không xác định được tổng tiền đơn hàng.',
                });
            }

            // 2) Gọi PaymentAdapter với tổng tiền đã xác định
            const result = await PaymentAdapter.process(paymentMethod, {
                orderId,
                totalAmount: amountToPay,
                userId,
            });

            if (!result.success) {
                return res.render('payment/result', {
                    title: 'Thanh toán thất bại',
                    success: false,
                    message: result.message,
                });
            }

            // 3. Lưu vào DB
            const payment = await PaymentModel.create({
                orderId,
                userId: userId || req.session?.authUser?.id,
                method: result.method,
                transactionId: result.transactionId,
                amount: Number(result.amount || amountToPay || 0),
                status: 'success',
            });

            // 4. Notify Observers (UserNotifier + KitchenNotifier)
            orderSubject.notify('ORDER_PAID', {
                orderId,
                userId: payment.user_id,
                transactionId: result.transactionId,
                amount: Number(result.amount || amountToPay || 0),
            });

            res.render('payment/result', {
                title: 'Thanh toán thành công',
                success: true,
                payment,
                result,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /payment/history – Lịch sử thanh toán
    async paymentHistory(req, res, next) {
        try {
            const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
            const payments = await PaymentModel.findByUserId(userId);

            res.render('payment/history', {
                title: 'Lịch sử thanh toán',
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

            if (!orderId || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin: orderId, paymentMethod',
                });
            }

            // 0) Validate: tồn tại đơn + trạng thái cho phép + chưa thanh toán
            const dbOrder = await OrderModel.findById(orderId);
            if (!dbOrder) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
            const status = String(dbOrder.status || '').toLowerCase();
            const blockedStatuses = new Set(['completed', 'done', 'paid', 'cancelled', 'canceled']);
            if (blockedStatuses.has(status)) {
                return res.status(409).json({ success: false, message: `Trạng thái '${dbOrder.status}' không cho phép thanh toán.` });
            }
            const existing = await PaymentModel.findByOrderId(orderId);
            if (existing) return res.status(409).json({ success: false, message: 'Đơn đã thanh toán.' });

            // Cho phép client không gửi totalAmount; tự lấy từ DB
            let amountToPay = Number(totalAmount || 0);
            if (!amountToPay) amountToPay = Number(dbOrder.total_amount || 0);
            if (!amountToPay) return res.status(400).json({ success: false, message: 'Không xác định được tổng tiền đơn hàng.' });

            const result = await PaymentAdapter.process(paymentMethod, {
                orderId,
                totalAmount: amountToPay,
                userId,
            });

            if (!result.success) {
                return res.status(402).json({ success: false, message: result.message });
            }

            const payment = await PaymentModel.create({
                orderId,
                userId,
                method: result.method,
                transactionId: result.transactionId,
                amount: Number(result.amount || amountToPay || 0),
                status: 'success',
            });

            orderSubject.notify('ORDER_PAID', {
                orderId,
                userId,
                transactionId: result.transactionId,
                amount: Number(result.amount || amountToPay || 0),
            });

            res.json({ success: true, payment, result });
        } catch (err) {
            next(err);
        }
    },
};

export default PaymentController;



