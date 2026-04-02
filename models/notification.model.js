/**
 * NotificationModel — tầng DB duy nhất cho bảng 'notifications'
 *
 * Chỉ làm việc với raw rows.
 * KHÔNG import domain class.
 * type nhận UPPERCASE từ NotificationService ('USER' | 'KITCHEN').
 */
import db from '../config/database.js';

const TABLE = 'notifications';
const base  = () => db(TABLE);

const NotificationModel = {

    async create({ userId, orderId, type, event, message, isRead = false }) {
        const parsedUserId  = userId  == null ? null : Number(userId);
        const parsedOrderId = orderId == null ? null : orderId;

        const [row] = await base()
            .insert({
                user_id:    Number.isFinite(parsedUserId) ? parsedUserId : null,
                order_id:   parsedOrderId,
                type:       (type  || '').toUpperCase(),   // 'USER' | 'KITCHEN'
                event:      event  || null,
                message:    message ?? null,
                is_read:    Boolean(isRead),
                created_at: new Date(),
            })
            .returning('*');
        return row;
    },

    /** Thông báo của một user cụ thể */
    async findByUserId(userId) {
        return base()
            .where({ type: 'USER', user_id: Number(userId) })
            .orderBy('created_at', 'desc');
    },

    /** Thông báo dành cho bếp */
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

    async countUnread(userId) {
        const row = await base()
            .where({ user_id: Number(userId), type: 'USER', is_read: false })
            .count({ cnt: '*' })
            .first();
        return Number(row?.cnt || 0);
    },
};

export default NotificationModel;
