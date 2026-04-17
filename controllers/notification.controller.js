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
                title: 'Thông báo',
                notifications: notifications.map(n => n.toJSON()),
                unread,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /notification/kitchen — trang thông báo bếp (Staff / Manager)
    async showKitchenNotifications(req, res, next) {
        try {
            const notifications = await NotificationService.findKitchenNotifications();
            return res.render('pages/notification/kitchen', {
                title: 'Bếp — Thông báo',
                notifications: notifications.map(n => n.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /notification/:id — chi tiết một thông báo
    async showNotificationDetail(req, res, next) {
        try {
            const userId = req.session?.authUser?.id;
            if (!userId) return res.redirect('/account/signin');

            const notification = await NotificationService.findById(Number(req.params.id));
            if (!notification) {
                return res.status(404).render('pages/error/404', { title: 'Không tìm thấy thông báo' });
            }

            // Chỉ cho phép xem thông báo của chính mình (hoặc KITCHEN nếu là staff)
            const role = req.session.authUser.role;
            if (notification.type === 'USER' && notification.userId !== userId) {
                return res.status(403).render('pages/error/403');
            }
            if (notification.type === 'KITCHEN' && !['STAFF', 'MANAGER'].includes(role)) {
                return res.status(403).render('pages/error/403');
            }

            // Tự động đánh dấu đã đọc
            if (!notification.isRead) {
                await NotificationService.markAsRead(notification.id);
                notification.isRead = true;
            }

            return res.render('pages/notification/detail', {
                title: 'Chi tiết thông báo',
                notification: notification.toJSON(),
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
};

export default NotificationController;
