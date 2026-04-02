/**
 * PaymentService
 *
 * Điểm vào duy nhất cho mọi thao tác Payment.
 * Controller KHÔNG được gọi PaymentModel / PaymentAdapter trực tiếp.
 *
 * Luồng xử lý thanh toán:
 *   1. Lấy Order domain qua OrderService (đảm bảo domain flow)
 *   2. Kiểm tra đơn chưa thanh toán
 *   3. Kiểm tra trạng thái đơn hợp lệ
 *   4. Tạo Payment domain (status = PENDING)
 *   5. Gọi PaymentAdapter.process() → kết quả từ Strategy
 *   6. Cập nhật Payment domain (markSuccess / markFailed)
 *   7. Lưu Payment qua PaymentModel (truyền plain data)
 *   8. Phát sự kiện ORDER_PAID qua Observer
 *   9. Trả Payment domain về Controller
 */
import PaymentModel      from '../../models/payment.model.js';
import { Payment, PAYMENT_STATUS } from './Payment.js';
import { PaymentAdapter } from './PaymentAdapter.js';
import { OrderService }   from '../order/OrderService.js';
import orderSubject       from '../notification/OrderSubject.js';
import { ORDER_STATUS }   from '../order/OrderState.js';

// Trạng thái đơn được phép thanh toán
const PAYABLE_STATUSES = new Set([ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED]);

export const PaymentService = {

    /**
     * Xử lý thanh toán cho một đơn hàng
     * @param {{ orderId, paymentMethod, userId }} params
     * @returns {Promise<Payment>} Payment domain object
     */
    async processPayment({ orderId, paymentMethod, userId }) {
        // 1. Lấy Order domain — đảm bảo đi qua domain layer
        const order = await OrderService.getOrder(orderId);

        // 2. Kiểm tra đã thanh toán chưa
        const existingRow = await PaymentModel.findByOrderId(orderId);
        if (existingRow) {
            const existing = Payment.fromRow(existingRow);
            if (existing.isSuccess()) throw new Error('Order already paid');
        }

        // 3. Kiểm tra trạng thái đơn
        if (!PAYABLE_STATUSES.has(order.getStatus())) {
            throw new Error(`Đơn hàng ở trạng thái ${order.getStatus()}, không thể thanh toán`);
        }

        // 4. Tạo Payment domain (status = PENDING)
        const payment = new Payment({
            orderId,
            userId,
            method: paymentMethod,
            amount: order.calculateTotal(),
            status: PAYMENT_STATUS.PENDING,
        });

        // 5. Gọi PaymentAdapter → Strategy → kết quả
        const result = await PaymentAdapter.process(paymentMethod, payment, order);

        // 6. Cập nhật Payment domain theo kết quả
        if (result.success) {
            payment.markSuccess(result.transactionId);
        } else {
            payment.markFailed(result.message);
            return payment; // Không lưu DB nếu thất bại (tuỳ yêu cầu dự án)
        }

        // 7. Lưu qua Model — truyền plain data, không truyền domain object
        const savedRow = await PaymentModel.create({
            orderId:       payment.orderId,
            userId:        payment.userId,
            method:        payment.method,
            transactionId: payment.transactionId,
            amount:        payment.amount,
            status:        payment.status,         // 'SUCCESS' (UPPERCASE)
            paidAt:        payment.paidAt,
        });
        // Gán id từ DB vào domain object
        payment.id = savedRow.id;

        // 8. Observer: thông báo ORDER_PAID
        orderSubject.notify('ORDER_PAID', {
            orderId,
            userId,
            transactionId: payment.transactionId,
            amount:        payment.amount,
        });

        // 9. Trả Payment domain
        return payment;
    },

    /**
     * Lịch sử thanh toán của user → mảng Payment domain
     */
    async getPaymentHistory(userId) {
        const rows = await PaymentModel.findByUserId(userId);
        return rows.map(row => Payment.fromRow(row));
    },

    /**
     * Lấy thông tin thanh toán của một đơn → Payment domain | null
     */
    async getByOrderId(orderId) {
        const row = await PaymentModel.findByOrderId(orderId);
        return Payment.fromRow(row);
    },

    getAvailableMethods() {
        return PaymentAdapter.getAvailableMethods();
    },
};
