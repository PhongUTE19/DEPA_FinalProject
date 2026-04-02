/**
 * OrderModel — tầng DB duy nhất cho bảng 'orders'
 *
 * Chỉ làm việc với raw DB rows (knex).
 * KHÔNG import domain class nào.
 * Mọi input nhận dưới dạng plain data (không nhận Order domain object).
 */
import db from '../config/database.js';

const TABLE = 'orders';
const base  = () => db(TABLE);

const OrderModel = {

    async create({ id, userId, items, status, totalAmount }) {
        const [row] = await base()
            .insert({
                id,
                user_id:      userId ?? null,
                items:        JSON.stringify(items),
                status,
                total_amount: Number(totalAmount) || 0,
                created_at:   new Date(),
            })
            .returning('*');
        return row;
    },

    async findById(id) {
        return base().where({ id }).first();
    },

    async findAll({ limit = 80, userId } = {}) {
        const q = base().orderBy('created_at', 'desc').limit(limit);
        if (userId != null) q.where({ user_id: Number(userId) });
        return q;
    },

    async updateStatus(id, status) {
        const [row] = await base()
            .where({ id })
            .update({ status })
            .returning('*');
        return row;
    },
};

export default OrderModel;
