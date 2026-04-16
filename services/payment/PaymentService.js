/**
 * PaymentService
 *
 * Điểm vào duy nhất cho mọi thao tác Payment.
 * Controller không được gọi PaymentModel / PaymentAdapter trực tiếp.
 *
 * Luồng processPayment:
 *   1. Lấy Order domain qua OrderService
 *   2. Kiểm tra đơn chưa thanh toán
 *   3. Kiểm tra trạng thái đơn hợp lệ (PENDING hoặc CONFIRMED)
 *   4. Tạo Payment domain (PENDING)
 *   5. PaymentAdapter.process() → Strategy → kết quả
 *   6. markSuccess() hoặc markFailed() trên domain
 *   7. Lưu qua PaymentModel (plain data)
 *   8. Phát sự kiện ORDER_PAID qua Observer
 *   9. Trả Payment domain về Controller
 */
import PaymentModel from '../../models/payment.model.js';
import { Payment, PAYMENT_STATUS } from './Payment.js';
import { PaymentAdapter } from './PaymentAdapter.js';
import { OrderService } from '../order/OrderService.js';
import { CouponService } from '../coupon/CouponService.js';
import orderSubject from '../notification/OrderSubject.js';
import { ORDER_STATUS } from '../order/OrderState.js';

const PAYABLE_STATUSES = new Set([ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED]);

export const PaymentService = {

    async processPayment({ orderId, paymentMethod, userId, totalAmount = null, couponCode = null }) {
        const order = await OrderService.getOrder(orderId);

        const existingRow = await PaymentModel.findByOrderId(orderId);
        if (existingRow) {
            const existing = Payment.fromRow(existingRow);
            if (existing.isSuccess()) throw new Error('Order already paid');
        }

        if (!PAYABLE_STATUSES.has(order.getStatus())) {
            throw new Error(`Đơn hàng ở trạng thái ${order.getStatus()}, không thể thanh toán`);
        }

        // Sử dụng totalAmount được truyền vào (coupon đã được apply), hoặc dùng giá gốc
        const amount = totalAmount !== null ? Number(totalAmount) : order.calculateTotal();

        const payment = new Payment({
            orderId,
            userId,
            method: paymentMethod,
            amount: amount,
            status: PAYMENT_STATUS.PENDING,
        });

        const result = await PaymentAdapter.process(paymentMethod, payment, order);

        if (result.success) {
            payment.markSuccess(result.transactionId);
        } else {
            payment.markFailed(result.message);
            return payment;
        }

        const savedRow = await PaymentModel.create({
            orderId: payment.orderId,
            userId: payment.userId,
            method: payment.method,
            transactionId: payment.transactionId,
            amount: payment.amount,
            status: payment.status,
            paidAt: payment.paidAt,
            failureReason: payment.failureReason,
        });
        payment.id = savedRow.id;

        // Nếu có coupon code, increment used_count khi thanh toán thành công
        if (couponCode) {
            try {
                await CouponService.markCouponUsed(couponCode);
            } catch (err) {
                console.error('Failed to mark coupon as used:', err);
                // Không throw - thanh toán đã success, chỉ log warning
            }
        }

        orderSubject.notify('ORDER_PAID', {
            orderId,
            userId,
            transactionId: payment.transactionId,
            amount: payment.amount,
        });

        return payment;
    },

    async getPaymentHistory(userId) {
        const rows = await PaymentModel.findByUserId(userId);
        return rows.map(row => Payment.fromRow(row));
    },

    async getByOrderId(orderId) {
        const row = await PaymentModel.findByOrderId(orderId);
        return Payment.fromRow(row);
    },

    getAvailableMethods() {
        return PaymentAdapter.getAvailableMethods();
    },
};
