import db from '../config/database.js';

// FIX: Orders use timestamp-based string IDs ("1700000000000-42").
// The orders table id column must be TEXT. Run this if migrating:
//
//   ALTER TABLE orders ALTER COLUMN id TYPE TEXT;

const OrderModel = {
  async create({ id, userId, items, customizations, status, totalAmount }) {
    const [order] = await db('orders')
      .insert({
        id:             String(id),        // FIX: keep as string
        user_id:        userId || null,
        items:          JSON.stringify(items || []),
        customizations: JSON.stringify(customizations || []),
        status:         status || 'pending',
        total_amount:   Number(totalAmount || 0),
        created_at:     new Date(),
      })
      .returning('*');
    return order;
  },

  async findById(id) {
    return db('orders').where({ id: String(id) }).first();  // FIX: string
  },

  async findByUserId(userId) {
    return db('orders')
      .where({ user_id: Number(userId) })
      .orderBy('created_at', 'desc');
  },

  async findAll() {
    return db('orders').orderBy('created_at', 'desc');
  },

  async updateStatus(id, status) {
    const [updated] = await db('orders')
      .where({ id: String(id) })           // FIX: string
      .update({ status })
      .returning('*');
    return updated;
  },
};

export default OrderModel;