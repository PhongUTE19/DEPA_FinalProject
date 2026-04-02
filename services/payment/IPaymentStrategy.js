export class IPaymentStrategy {
    /**
     * @param {object} order - { orderId, totalAmount, userId }
     * @returns {object} - { success, transactionId, message }
     */
    async pay(order) {
        throw new Error('pay() must be implemented by subclass');
    }

    getName() {
        throw new Error('getName() must be implemented by subclass');
    }
}
