import db from '../config/database.js';

const OrderModel = {
  async create({ id, userId, items, customizations, status, totalAmount }) {
    const [order] = await db('orders')
      .insert({
        id,
        user_id: userId || null,
        // Using JSON.stringify for JSONB columns in PostgreSQL
        items: JSON.stringify(items || []),
        customizations: JSON.stringify(customizations || []),
        status: status || 'pending',
        total_amount: Number(totalAmount || 0),
        created_at: new Date(),
      })
      .returning('*');
    return order;
  },

  async findById(id) {
    return db('orders').where({ id }).first();
  },

  async findByUserId(userId) {
    return db('orders')
      .where({ user_id: Number(userId) })
      .orderBy('created_at', 'desc');
  },

  async updateStatus(id, status) {
    const [updated] = await db('orders')
      .where({ id })
      .update({ status })
      .returning('*');
    return updated;
  },
};

export default OrderModel;