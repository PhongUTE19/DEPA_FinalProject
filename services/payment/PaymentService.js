import PaymentModel from '../../models/payment.model.js';
import { Payment } from './Payment.js';
import { PaymentAdapter } from './PaymentAdapter.js';
import orderSubject from '../notification/OrderSubject.js';
import { OrderService } from '../order/OrderService.js';

export const PaymentService = {

    async processPayment({ orderId, paymentMethod, userId }) {

        const order = await OrderService.getOrder(orderId);

        const existingPayment = await PaymentModel.findByOrderId(orderId);
        if (existingPayment) {
            throw new Error('Order already paid');
        }

        const status = String(order.getStatus() || '').toLowerCase();
        const allowedStatuses = new Set(['pending', 'new', '']);
        if (!allowedStatuses.has(status)) {
            throw new Error(`Invalid order status: ${order.getStatus()}`);
        }

        const amountToPay = order.calculateTotal();
        if (!amountToPay) {
            throw new Error('Invalid order amount');
        }

        const payment = new Payment({
            orderId,
            userId,
            method: paymentMethod,
            amount: amountToPay
        });

        const result = await PaymentAdapter.process(paymentMethod, {
            orderId,
            totalAmount: amountToPay,
            userId
        });

        if (!result.success) {
            payment.markFailed(result.message);
            return payment;
        }

        payment.markSuccess(result.transactionId);

        await PaymentModel.create({
            orderId,
            userId,
            method: result.method,
            transactionId: result.transactionId,
            amount: result.amount,
            status: payment.status
        });

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

        return rows.map((row) => Payment.fromRow(row));
    },

    getAvailableMethods() {
        return PaymentAdapter.getAvailableMethods();
    }
};
