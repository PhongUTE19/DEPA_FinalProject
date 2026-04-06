/**
 * PaymentModel
 * Schema: payments(id SERIAL, order_id int4, user_id int4, method, transaction_id,
 *                  amount, status, paid_at, failure_reason, created_at)
 * order_id là integer (khớp với orders.id SERIAL int4).
 */
import db from '../config/database.js';

const TABLE = 'payments';
const base  = () => db(TABLE);

const PaymentModel = {

    async create({ orderId, userId, method, transactionId, amount, status, paidAt, failureReason }) {
        const [row] = await base()
            .insert({
                order_id:       Number(orderId),        // integer
                user_id:        userId == null ? null : Number(userId),
                method:         method ?? null,
                transaction_id: transactionId ?? null,
                amount:         Number(amount) || 0,
                status:         (status || 'PENDING').toUpperCase(),
                paid_at:        paidAt ?? null,
                failure_reason: failureReason ?? null,
                created_at:     new Date(),
            })
            .returning('*');
        return row;
    },

    async findByOrderId(orderId) {
        return base().where({ order_id: Number(orderId) }).first();
    },

    async findById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async findByUserId(userId) {
        return base()
            .where({ user_id: Number(userId) })
            .orderBy('created_at', 'desc');
    },

    async updateStatus(id, status) {
        const [row] = await base()
            .where({ id: Number(id) })
            .update({ status: status.toUpperCase() })
            .returning('*');
        return row;
    },
};

export default PaymentModel;
