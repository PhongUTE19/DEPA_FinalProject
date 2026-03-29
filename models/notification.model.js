import db from '../config/database.js';

const NotificationModel = {
  async create(payload) {
    // Chuẩn hoá dữ liệu theo schema bảng notifications:
    // id (serial), user_id int4, order_id int4, type text, event text,
    // message text, is_read bool, created_at timestamptz
    const parsedUserId = Number(payload.user_id);
    const parsedOrderId = Number(payload.order_id);
    const normalized = {
      user_id: payload.user_id == null || payload.user_id === '' || !Number.isFinite(parsedUserId)
        ? null
        : parsedUserId,
      order_id: payload.order_id == null || payload.order_id === '' || !Number.isFinite(parsedOrderId)
        ? null
        : parsedOrderId,
      type: (payload.type || '').trim() || null,
      event: (payload.event || '').trim() || null,
      message: payload.message ?? null,
      is_read: payload.is_read ?? false,
      created_at: new Date()
    };

    const [row] = await db('notifications')
      .insert(normalized)
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
