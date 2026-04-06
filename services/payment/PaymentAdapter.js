/**
 * PaymentAdapter — Adapter Pattern
 *
 * Chuẩn hoá input/output của các PaymentStrategy.
 * PaymentService chỉ gọi PaymentAdapter.process() — không gọi strategy trực tiếp.
 *
 * process(paymentMethod, payment, order):
 *   payment — Payment domain object (có orderId, userId, amount)
 *   order   — Order domain object (để lấy totalAmount)
 *   trả về  — { success, transactionId, message, method, amount }
 */
import { CashPaymentStrategy } from './CashPaymentStrategy.js';
import { BankPaymentStrategy } from './BankPaymentStrategy.js';
import { MomoPaymentStrategy } from './MomoPaymentStrategy.js';

const STRATEGY_MAP = {
    cash: new CashPaymentStrategy(),
    bank: new BankPaymentStrategy(),
    momo: new MomoPaymentStrategy(),
};

export class PaymentAdapter {

    static getStrategy(paymentMethod) {
        const strategy = STRATEGY_MAP[(paymentMethod || '').toLowerCase()];
        if (!strategy) throw new Error(`Phương thức thanh toán không hợp lệ: ${paymentMethod}`);
        return strategy;
    }

    static normalizeInput(payment, order) {
        return {
            orderId:     payment.orderId,
            totalAmount: order.calculateTotal(),
            userId:      payment.userId,
        };
    }

    static normalizeResult(raw, method) {
        return {
            success:       Boolean(raw.success),
            transactionId: raw.transactionId || null,
            message:       raw.message || '',
            method,
            amount:        Number(raw.amount) || 0,
        };
    }

    static async process(paymentMethod, payment, order) {
        const strategy = this.getStrategy(paymentMethod);
        const input    = this.normalizeInput(payment, order);
        const raw      = await strategy.pay(input);
        return this.normalizeResult(raw, paymentMethod);
    }

    static getAvailableMethods() {
        return Object.keys(STRATEGY_MAP);
    }
}
