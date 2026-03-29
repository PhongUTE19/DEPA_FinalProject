// ===================================================
// STRATEGY PATTERN — Interface (Abstract base class)
// Mục đích: Định nghĩa interface chung cho tất cả
//           các phương thức thanh toán
// Lợi ích:  Dễ thêm phương thức mới mà không sửa code cũ
// ===================================================

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
