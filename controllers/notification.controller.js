/**
 * NotificationController
 *
 * Chỉ nhận req → gọi NotificationService → gọi .toJSON() → trả res.
 * KHÔNG import NotificationModel trực tiếp.
 */
import { NotificationService } from '../services/notification/NotificationService.js';

const NotificationController = {

    // GET /notification — trang thông báo của user (SSR)
    async showNotificationsPage(req, res, next) {
        try {
            const userId = req.session?.authUser?.id;
            if (!userId) return res.redirect('/account/signin');

            const [notifications, unread] = await Promise.all([
                NotificationService.findByUserId(userId),
                NotificationService.countUnread(userId),
            ]);

            return res.render('pages/notification/index', {
                title:         'Thông báo',
                notifications: notifications.map(n => n.toJSON()),
                unread,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /notification/kitchen — trang thông báo bếp (Staff / Chef / Manager)
    async showKitchenNotifications(req, res, next) {
        try {
            const notifications = await NotificationService.findKitchenNotifications();
            return res.render('pages/notification/kitchen', {
                title:         'Bếp — Thông báo',
                notifications: notifications.map(n => n.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /notification/read-all — đánh dấu tất cả đã đọc
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.session?.authUser?.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });

            await NotificationService.markAllAsRead(userId);
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /notification/:id/read — đánh dấu một thông báo đã đọc
    async markAsRead(req, res, next) {
        try {
            await NotificationService.markAsRead(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    // POST /notification/trigger — test hook (dev only)
    async triggerEvent(req, res) {
        return res.json({ ok: true, message: 'Events are triggered by OrderService / PaymentService via Observer' });
    },
};

export default NotificationController;
