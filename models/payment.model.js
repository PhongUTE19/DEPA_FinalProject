import db from '../config/database.js';

const tableName = 'payments';

const baseQuery = () => db(tableName);

const PaymentModel = {
  async create({ orderId, userId, method, transactionId, amount, status = 'success' }) {
    const [payment] = await baseQuery()
      .insert({
        order_id: String(orderId),
        user_id: userId == null ? null : Number(userId),
        method: method ?? null,
        transaction_id: transactionId ?? null,
        amount: Number(amount || 0),
        status,
        paid_at: new Date(),
        created_at: new Date(),
      })
      .returning('*');
    return payment;
  },

  async findByOrderId(orderId) {
    return baseQuery().where({ order_id: String(orderId) }).first();
  },

  async findById(id) {
    return baseQuery().where({ id: Number(id) }).first();
  },

  async findByUserId(userId) {
    return baseQuery()
      .where({ user_id: Number(userId) })
      .orderBy('created_at', 'desc');
  },

  async updateStatus(id, status) {
    const [updated] = await baseQuery()
      .where({ id: Number(id) })
      .update({ status })
      .returning('*');
    return updated;
  },
};

export default PaymentModel;
