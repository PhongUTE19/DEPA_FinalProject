import { IPaymentStrategy } from './IPaymentStrategy.js';

export class CashPaymentStrategy extends IPaymentStrategy {
    getName() { return 'cash'; }

    async pay({ orderId, totalAmount }) {
        return {
            success: true,
            transactionId: `CASH-${Date.now()}-${orderId}`,
            message: 'Thanh toán tiền mặt khi nhận hàng',
            method: 'cash',
            amount: totalAmount,
        };
    }
}
