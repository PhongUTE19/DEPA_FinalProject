/**
 * PaymentAdapter — Adapter Pattern
 *
 * Chuẩn hoá input/output của các PaymentStrategy khác nhau.
 * PaymentService chỉ gọi PaymentAdapter.process() — không gọi strategy trực tiếp.
 *
 * Input vào process(): plain data { orderId, totalAmount, userId }
 *   (trích xuất từ Payment domain + Order domain)
 * Output: PaymentResult chuẩn hoá
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

    /** @returns {IPaymentStrategy} */
    static getStrategy(paymentMethod) {
        const strategy = STRATEGY_MAP[(paymentMethod || '').toLowerCase()];
        if (!strategy) {
            throw new Error(`Phương thức thanh toán không hợp lệ: ${paymentMethod}`);
        }
        return strategy;
    }

    /**
     * Chuẩn hoá input từ Payment + Order domain → PaymentInput cho strategy
     * @param {Payment} payment  - Payment domain object
     * @param {Order}   order    - Order domain object
     * @returns {{ orderId, totalAmount, userId }}
     */
    static normalizeInput(payment, order) {
        return {
            orderId:     payment.orderId,
            totalAmount: order.calculateTotal(),
            userId:      payment.userId,
        };
    }

    /**
     * Chuẩn hoá kết quả thô từ strategy → PaymentResult
     */
    static normalizeResult(raw, method) {
        return {
            success:       Boolean(raw.success),
            transactionId: raw.transactionId || null,
            message:       raw.message || '',
            method:        method,
            amount:        Number(raw.amount) || 0,
        };
    }

    /**
     * Thực hiện thanh toán.
     * @param {string}  paymentMethod
     * @param {Payment} payment  - Payment domain (có orderId, userId, amount)
     * @param {Order}   order    - Order domain (để lấy totalAmount)
     * @returns {Promise<PaymentResult>}
     */
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
