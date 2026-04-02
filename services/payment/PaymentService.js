import PaymentModel from '../../models/payment.model.js';
import OrderModel from '../../models/order.model.js';
import { Payment } from './Payment.js';
import { PaymentAdapter } from './PaymentAdapter.js';
import orderSubject from '../notification/OrderSubject.js';

export const PaymentService = {

    async processPayment({ orderId, paymentMethod, totalAmount, userId }) {

        // 1. Validate order
        const dbOrder = await OrderModel.findById(orderId);
        if (!dbOrder) {
            throw new Error('Order not found');
        }

        // 2. Check already paid
        const existingPayment = await PaymentModel.findByOrderId(orderId);
        if (existingPayment) {
            throw new Error('Order already paid');
        }

        // 3. Validate status
        const status = String(dbOrder.status || '').toLowerCase();
        const allowedStatuses = new Set(['pending', 'new', '']);
        if (!allowedStatuses.has(status)) {
            throw new Error(`Invalid order status: ${dbOrder.status}`);
        }

        // 4. ALWAYS trust DB amount
        const amountToPay = Number(dbOrder.total_amount || 0);
        if (!amountToPay) {
            throw new Error('Invalid order amount');
        }

        // 5. Create domain object
        const payment = new Payment({
            orderId,
            userId,
            method: paymentMethod,
            amount: amountToPay
        });

        // 6. Process via Strategy
        const result = await PaymentAdapter.process(paymentMethod, {
            orderId,
            totalAmount: amountToPay,
            userId
        });

        if (!result.success) {
            payment.markFailed(result.message);
            return payment;
        }

        // 7. Mark success
        payment.markSuccess(result.transactionId);

        // 8. Save to DB
        const saved = await PaymentModel.create({
            orderId,
            userId,
            method: result.method,
            transactionId: result.transactionId,
            amount: result.amount,
            status: payment.status
        });

        // 9. Notify observers
        orderSubject.notify('ORDER_PAID', {
            orderId,
            userId,
            transactionId: result.transactionId,
            amount: result.amount
        });

        return payment;
    },


    async getPaymentHistory(userId) {
        const rows = await PaymentModel.findByUserId(userId);

        return rows.map(p => new Payment({
            orderId: p.order_id,
            userId: p.user_id,
            method: p.method,
            amount: p.amount
        }));
    },

    getAvailableMethods() {
        return PaymentAdapter.getAvailableMethods();
    }
};