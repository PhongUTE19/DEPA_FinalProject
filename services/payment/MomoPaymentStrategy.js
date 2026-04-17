import { IPaymentStrategy } from './IPaymentStrategy.js';

export class MomoPaymentStrategy extends IPaymentStrategy {
    getName() { return 'momo'; }

    async pay({ orderId, totalAmount }) {
        return {
            success: true,
            transactionId: `MOMO-${Date.now()}-${orderId}`,
            message: 'Thanh toán MoMo thành công',
            method: 'momo',
            amount: totalAmount,
        };
    }
}
