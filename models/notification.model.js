import db from '../config/database.js';

const mem = { notifications: [] };

const NotificationModel = {
    async create(payload) {
        if (!DB_ENABLED) {
            const row = { id: mem.notifications.length + 1, ...payload, created_at: new Date(), is_read: false };
            mem.notifications.unshift(row);
            return row;
        }
        const [row] = await db('notifications').insert({ ...payload, created_at: new Date() }).returning('*');
        return row;
    },

    async findByUserId(userId) {
        if (!DB_ENABLED) return mem.notifications.filter(n => n.type === 'user' && n.user_id === Number(userId));
        return db('notifications').where({ type: 'user', user_id: userId }).orderBy('created_at', 'desc');
    },

    async findKitchenNotifications() {
        if (!DB_ENABLED) return mem.notifications.filter(n => n.type === 'kitchen');
        return db('notifications').where({ type: 'kitchen' }).orderBy('created_at', 'desc');
    },

    async markAllAsRead(userId) {
        if (!DB_ENABLED) { mem.notifications.forEach(n => { if (n.user_id === Number(userId) && n.type === 'user') n.is_read = true; }); return { count: true }; }
        return db('notifications').where({ user_id: userId, type: 'user' }).update({ is_read: true });
    },

    async markAsRead(id) {
        if (!DB_ENABLED) { const n = mem.notifications.find(n => n.id === Number(id)); if (n) n.is_read = true; return n || null; }
        return db('notifications').where({ id }).update({ is_read: true });
    },

    async countUnread(userId) {
        if (!DB_ENABLED) return mem.notifications.filter(n => n.user_id === Number(userId) && n.type === 'user' && !n.is_read).length;
        const row = await db('notifications').where({ user_id: userId, type: 'user', is_read: false }).count({ cnt: '*' }).first();
        return Number(row?.cnt || 0);
    },
};

export default NotificationModel;
