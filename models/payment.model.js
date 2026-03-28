import db from '../config/database.js';

const PaymentModel = {
    // Tạo bản ghi thanh toán mới
    async create({ orderId, userId, method, transactionId, amount, status = 'success' }) {
        const [payment] = await db('payments')
            .insert({
                order_id: orderId,
                user_id: userId,
                method,
                transaction_id: transactionId,
                amount,
                status,
                paid_at: new Date(),
                created_at: new Date(),
            })
            .returning('*');
        return payment;
    },

    // Tìm payment theo orderId
    async findByOrderId(orderId) {
        return db('payments').where({ order_id: orderId }).first();
    },

    // Tìm payment theo id
    async findById(id) {
        return db('payments').where({ id }).first();
    },

    // Lấy lịch sử thanh toán của user
    async findByUserId(userId) {
        return db('payments')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');
    },

    // Cập nhật trạng thái
    async updateStatus(id, status) {
        const [updated] = await db('payments')
            .where({ id })
            .update({ status })
            .returning('*');
        return updated;
    },
};

export default PaymentModel;
