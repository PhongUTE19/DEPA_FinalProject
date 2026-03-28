// ===================================================
// STRATEGY PATTERN — Concrete Strategy: Cash
// Mục đích: Xử lý thanh toán tiền mặt
// ===================================================

import { IPaymentStrategy } from './IPaymentStrategy.js';

export class CashPaymentStrategy extends IPaymentStrategy {
    getName() {
        return 'cash';
    }

    async pay(order) {
        // Tiền mặt luôn thành công (thu tiền khi giao hàng)
        const transactionId = `CASH-${Date.now()}-${order.orderId}`;

        return {
            success: true,
            transactionId,
            message: 'Thanh toán tiền mặt khi nhận hàng',
            method: 'cash',
            amount: order.totalAmount,
        };
    }
}
