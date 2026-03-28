import NotificationModel from '../models/notification.model.js';
import orderSubject from '../services/notification/OrderSubject.js';

const NotificationController = {
    // GET /notification — Trang thông báo của user
    async showNotifications(req, res, next) {
        try {
            const userId = req.session?.authUser?.id;
            const notifications = await NotificationModel.findByUserId(userId);
            const unreadCount = notifications.filter(n => !n.is_read).length;

            res.render('pages/notification/index', {
                title: 'Thông báo',
                notifications,
                unreadCount,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /notification/kitchen — Bảng thông báo bếp
    async showKitchenNotifications(req, res, next) {
        try {
            const notifications = await NotificationModel.findKitchenNotifications();

            res.render('pages/notification/kitchen', {
                title: 'Thông báo bếp',
                notifications,
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /notification/:id/read — Đánh dấu đã đọc
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            await NotificationModel.markAsRead(id);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /notification/read-all — Đánh dấu tất cả đã đọc
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.session?.authUser?.id;
            await NotificationModel.markAllAsRead(userId);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    // POST /api/notification/trigger — Test: trigger event thủ công
    async triggerEvent(req, res, next) {
        try {
            const { event, data } = req.body;
            orderSubject.notify(event, data);
            res.json({ success: true, message: `Event "${event}" đã được phát` });
        } catch (err) {
            next(err);
        }
    },
};

export default NotificationController;
