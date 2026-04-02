/**
 * IPaymentStrategy — Strategy Pattern (interface)
 *
 * Mọi strategy nhận Payment domain object, trả PaymentResult.
 *
 * @typedef {object} PaymentInput
 * @property {string}  orderId
 * @property {number}  totalAmount
 * @property {number|null} userId
 *
 * @typedef {object} PaymentResult
 * @property {boolean} success
 * @property {string}  transactionId
 * @property {string}  message
 * @property {string}  method
 * @property {number}  amount
 */
export class IPaymentStrategy {
    /**
     * @param {PaymentInput} input
     * @returns {Promise<PaymentResult>}
     */
    async pay(input) {
        throw new Error('pay() must be implemented by subclass');
    }

    /** @returns {string} tên method: 'cash' | 'bank' | 'momo' */
    getName() {
        throw new Error('getName() must be implemented by subclass');
    }
}
