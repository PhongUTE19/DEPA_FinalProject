import db from '../config/database.js';

// FIX: The notifications table has order_id as INTEGER in most Postgres setups,
// but our order IDs are timestamp-based strings like "1700000000000-123".
// Two options: (a) change the column to TEXT, or (b) store null for order_id
// and put the string id in the message (which is already there).
// We go with option (b) — zero schema changes required, message already contains
// the order reference, so order_id in the table stays null for string-id orders.

const NotificationModel = {
  async create(payload) {
    // FIX: Sanitize order_id — only pass it if it's actually a valid integer.
    // String-based order IDs (e.g. "1700000000000-42") cannot go into an INT column.
    const safePayload = {
      ...payload,
      order_id: isValidIntegerId(payload.order_id) ? Number(payload.order_id) : null,
      created_at: new Date(),
    };

    try {
      const [row] = await db('notifications')
        .insert(safePayload)
        .returning('*');
      return row;
    } catch (err) {
      // Log but don't crash the request — notifications are non-critical
      console.error('[NotificationModel] create error:', err.message);
      return null;
    }
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

// Helper: returns true only for values that are safe to cast to a Postgres INTEGER
function isValidIntegerId(val) {
  if (val === null || val === undefined) return false;
  const n = Number(val);
  return Number.isInteger(n) && n > 0 && n <= 2147483647;
}

export default NotificationModel;