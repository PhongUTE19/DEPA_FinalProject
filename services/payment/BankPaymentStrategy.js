// ===================================================
// STRATEGY PATTERN — Concrete Strategy: Bank Transfer
// Mục đích: Xử lý thanh toán chuyển khoản ngân hàng
// ===================================================

import { IPaymentStrategy } from './IPaymentStrategy.js';

export class BankPaymentStrategy extends IPaymentStrategy {
    getName() {
        return 'bank';
    }

    async pay(order) {
        // Simulate bank transfer (luôn success theo yêu cầu README)
        const transactionId = `BANK-${Date.now()}-${order.orderId}`;

        return {
            success: true,
            transactionId,
            message: 'Thanh toán chuyển khoản ngân hàng thành công',
            method: 'bank',
            amount: order.totalAmount,
        };
    }
}
