/**
 * NotificationModel
 * Schema: notifications(id SERIAL, user_id int4, order_id int4, type, event,
 *                        message, is_read, created_at)
 * order_id là integer (khớp với orders.id SERIAL int4).
 * type: 'USER' | 'KITCHEN' (CHECK constraint trên DB).
 */
import db from '../config/database.js';

const TABLE = 'notifications';
const base = () => db(TABLE);

const NotificationModel = {

    async create({ userId, orderId, type, event, message, isRead = false }) {
        const [row] = await base()
            .insert({
                user_id: userId == null ? null : Number(userId),
                order_id: orderId == null ? null : Number(orderId),  // integer
                type: (type || '').toUpperCase(),
                event: event ?? null,
                message: message ?? null,
                is_read: Boolean(isRead),
                created_at: new Date(),
            })
            .returning('*');
        return row;
    },

    async findByUserId(userId) {
        return base()
            .where({ type: 'USER', user_id: Number(userId) })
            .orderBy('created_at', 'desc');
    },

    async findKitchenNotifications() {
        return base()
            .where({ type: 'KITCHEN' })
            .orderBy('created_at', 'desc');
    },

    async markAllAsRead(userId) {
        return base()
            .where({ user_id: Number(userId), type: 'USER' })
            .update({ is_read: true });
    },

    async markAsRead(id) {
        return base()
            .where({ id: Number(id) })
            .update({ is_read: true });
    },

    async findById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async countUnread(userId) {
        const row = await base()
            .where({ user_id: Number(userId), type: 'USER', is_read: false })
            .count({ cnt: '*' })
            .first();
        return Number(row?.cnt || 0);
    },
};

export default NotificationModel;
