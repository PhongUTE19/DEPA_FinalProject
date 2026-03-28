import db from '../config/database.js';

const mem = { payments: [] };

const PaymentModel = {
    async create({ orderId, userId, method, transactionId, amount, status = 'success' }) {
        if (!DB_ENABLED) {
            const row = { id: mem.payments.length + 1, order_id: Number(orderId), user_id: userId ?? null, method, transaction_id: transactionId, amount: Number(amount || 0), status, paid_at: new Date(), created_at: new Date() };
            mem.payments.unshift(row);
            return row;
        }
        const [payment] = await db('payments')
            .insert({ order_id: Number(orderId), user_id: userId, method, transaction_id: transactionId, amount: Number(amount || 0), status, paid_at: new Date(), created_at: new Date() })
            .returning('*');
        return payment;
    },

    async findByOrderId(orderId) {
        if (!DB_ENABLED) return mem.payments.find(p => p.order_id === Number(orderId)) || null;
        return db('payments').where({ order_id: Number(orderId) }).first();
    },

    async findById(id) {
        if (!DB_ENABLED) return mem.payments.find(p => p.id === Number(id)) || null;
        return db('payments').where({ id }).first();
    },

    async findByUserId(userId) {
        if (!DB_ENABLED) return mem.payments.filter(p => p.user_id === Number(userId));
        return db('payments').where({ user_id: userId }).orderBy('created_at', 'desc');
    },

    async updateStatus(id, status) {
        if (!DB_ENABLED) {
            const p = mem.payments.find(x => x.id === Number(id));
            if (p) p.status = status;
            return p || null;
        }
        const [updated] = await db('payments').where({ id }).update({ status }).returning('*');
        return updated;
    },
};

export default PaymentModel;
