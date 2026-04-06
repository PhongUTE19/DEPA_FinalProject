/**
 * IPaymentStrategy — Strategy Pattern (interface)
 *
 * Subclass phải implement:
 *   pay(input)  — input: { orderId, totalAmount, userId }
 *                 trả về: { success, transactionId, message, method, amount }
 *   getName()   — trả về tên method: 'cash' | 'bank' | 'momo'
 */
export class IPaymentStrategy {
    async pay(input) {
        throw new Error('pay() must be implemented by subclass');
    }

    getName() {
        throw new Error('getName() must be implemented by subclass');
    }
}
