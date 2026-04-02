import { IPaymentStrategy } from './IPaymentStrategy.js';

export class MomoPaymentStrategy extends IPaymentStrategy {
    getName() {
        return 'momo';
    }

    async pay(order) {
        const transactionId = `MOMO-${Date.now()}-${order.orderId}`;

        return {
            success: true,
            transactionId,
            message: 'Thanh toán MoMo thành công',
            method: 'momo',
            amount: order.totalAmount,
        };
    }
}
