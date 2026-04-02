import { CashPaymentStrategy } from './CashPaymentStrategy.js';
import { BankPaymentStrategy } from './BankPaymentStrategy.js';
import { MomoPaymentStrategy } from './MomoPaymentStrategy.js';

// Map tên phương thức → Strategy tương ứng
const STRATEGY_MAP = {
    cash: new CashPaymentStrategy(),
    bank: new BankPaymentStrategy(),
    momo: new MomoPaymentStrategy(),
};

export class PaymentAdapter {
    static getStrategy(paymentMethod) {
        const strategy = STRATEGY_MAP[paymentMethod?.toLowerCase()];
        if (!strategy) {
            throw new Error(`Phương thức thanh toán không hợp lệ: ${paymentMethod}`);
        }
        return strategy;
    }

    static normalizeOrder(rawOrder) {
        return {
            orderId: rawOrder.orderId || rawOrder.order_id,
            totalAmount: Number(rawOrder.totalAmount || rawOrder.total_amount || 0),
            userId: rawOrder.userId || rawOrder.user_id,
        };
    }

    static normalizeResult(rawResult, paymentMethod) {
        return {
            success: Boolean(rawResult.success),
            transactionId: rawResult.transactionId || null,
            message: rawResult.message || '',
            method: paymentMethod,
            amount: rawResult.amount || 0,
            paidAt: new Date().toISOString(),
        };
    }

    static async process(paymentMethod, rawOrder) {
        const strategy = this.getStrategy(paymentMethod);
        const order = this.normalizeOrder(rawOrder);
        const rawResult = await strategy.pay(order);
        return this.normalizeResult(rawResult, paymentMethod);
    }

    static getAvailableMethods() {
        return Object.keys(STRATEGY_MAP);
    }
}
