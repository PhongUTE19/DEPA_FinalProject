import db from '../config/database.js';

const TABLE = 'orders';
const base  = () => db(TABLE);

const OrderModel = {

    async create({ userId, items, status, totalAmount }) {
        const [row] = await base()
            .insert({
                user_id:      userId ?? null,
                items:        JSON.stringify(items),
                status:       (status || 'PENDING').toUpperCase(),
                total_amount: Number(totalAmount) || 0,
                created_at:   new Date(),
            })
            .returning('*');
        return row;
    },

    async findById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async findAll({ limit = 80, userId } = {}) {
        const q = base().orderBy('created_at', 'desc').limit(limit);
        if (userId != null) q.where({ user_id: Number(userId) });
        return q;
    },

    async updateStatus(id, status) {
        const [row] = await base()
            .where({ id: Number(id) })
            .update({ status: status.toUpperCase() })
            .returning('*');
        return row;
    },
};

export default OrderModel;
