import { IPaymentStrategy } from './IPaymentStrategy.js';

export class BankPaymentStrategy extends IPaymentStrategy {
    getName() { return 'bank'; }

    async pay({ orderId, totalAmount }) {
        return {
            success:       true,
            transactionId: `BANK-${Date.now()}-${orderId}`,
            message:       'Thanh toán chuyển khoản ngân hàng thành công',
            method:        'bank',
            amount:        totalAmount,
        };
    }
}
