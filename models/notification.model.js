import db from '../config/database.js';

const NotificationModel = {
    // Lấy tất cả notification của user
    async findByUserId(userId) {
        return db('notifications')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');
    },

    // Lấy notification của bếp
    async findKitchenNotifications() {
        return db('notifications')
            .where({ type: 'kitchen' })
            .orderBy('created_at', 'desc')
            .limit(50);
    },

    // Đánh dấu đã đọc
    async markAsRead(id) {
        const [updated] = await db('notifications')
            .where({ id })
            .update({ is_read: true })
            .returning('*');
        return updated;
    },

    // Đánh dấu tất cả đã đọc cho user
    async markAllAsRead(userId) {
        return db('notifications')
            .where({ user_id: userId, is_read: false })
            .update({ is_read: true });
    },

    // Đếm notification chưa đọc
    async countUnread(userId) {
        const result = await db('notifications')
            .where({ user_id: userId, is_read: false })
            .count('id as count')
            .first();
        return parseInt(result?.count || 0);
    },
};

export default NotificationModel;
