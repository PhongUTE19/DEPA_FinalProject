import db from '../config/database.js';

// FIX: The root cause of payment not working was that order IDs are timestamp-based
// strings ("1700000000000-42") but the original code did Number(orderId) everywhere,
// turning them into NaN or a nonsense large number.
//
// The payments table's order_id column should be TEXT (or VARCHAR).
// If your existing schema has it as INTEGER, run this migration:
//
//   ALTER TABLE payments ALTER COLUMN order_id TYPE TEXT;
//
// Then this model works correctly for all order ID formats.

const PaymentModel = {
  async create({ orderId, userId, method, transactionId, amount, status = 'success' }) {
    const [payment] = await db('payments')
      .insert({
        order_id:       String(orderId),   // FIX: always string, never Number()
        user_id:        userId ?? null,
        method,
        transaction_id: transactionId,
        amount:         Number(amount || 0),
        status,
        paid_at:        new Date(),
        created_at:     new Date(),
      })
      .returning('*');
    return payment;
  },

  async findByOrderId(orderId) {
    return db('payments')
      .where({ order_id: String(orderId) })  // FIX: string comparison
      .first();
  },

  async findById(id) {
    return db('payments').where({ id: Number(id) }).first();
  },

  async findByUserId(userId) {
    return db('payments')
      .where({ user_id: Number(userId) })
      .orderBy('created_at', 'desc');
  },

  async updateStatus(id, status) {
    const [updated] = await db('payments')
      .where({ id: Number(id) })
      .update({ status })
      .returning('*');
    return updated;
  },
};

export default PaymentModel;