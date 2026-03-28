import db from '../config/database.js';

const NotificationModel = {
  async create(payload) {
    const [row] = await db('notifications')
      .insert({ ...payload, created_at: new Date() })
      .returning('*');
    return row;
  },

  async findByUserId(userId) {
    return db('notifications')
      .where({ type: 'user', user_id: Number(userId) })
      .orderBy('created_at', 'desc');
  },

  async findKitchenNotifications() {
    return db('notifications')
      .where({ type: 'kitchen' })
      .orderBy('created_at', 'desc');
  },

  async markAllAsRead(userId) {
    return db('notifications')
      .where({ user_id: Number(userId), type: 'user' })
      .update({ is_read: true });
  },

  async markAsRead(id) {
    return db('notifications')
      .where({ id: Number(id) })
      .update({ is_read: true });
  },

  async countUnread(userId) {
    const row = await db('notifications')
      .where({ user_id: Number(userId), type: 'user', is_read: false })
      .count({ cnt: '*' })
      .first();
    return Number(row?.cnt || 0);
  },
};

export default NotificationModel;
