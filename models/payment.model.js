/**
 * PaymentModel — tầng DB duy nhất cho bảng 'payments'
 *
 * Chỉ làm việc với raw rows.
 * KHÔNG import domain class.
 * status nhận string UPPERCASE từ PaymentService (đã markSuccess/markFailed).
 */
import db from '../config/database.js';

const TABLE = 'payments';
const base  = () => db(TABLE);

const PaymentModel = {

    async create({ orderId, userId, method, transactionId, amount, status, paidAt }) {
        const [row] = await base()
            .insert({
                order_id:       String(orderId),
                user_id:        userId == null ? null : Number(userId),
                method:         method ?? null,
                transaction_id: transactionId ?? null,
                amount:         Number(amount) || 0,
                status:         status ?? 'PENDING',     // UPPERCASE từ domain
                paid_at:        paidAt ?? null,
                created_at:     new Date(),
            })
            .returning('*');
        return row;
    },

    async findByOrderId(orderId) {
        return base().where({ order_id: String(orderId) }).first();
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
            .update({ status })
            .returning('*');
        return row;
    },
};

export default PaymentModel;
