import { NotificationService } from '../services/notification/NotificationService.js';

const NotificationController = {
  async showNotifications(req, res, next) {
    try {
      const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
      const notifications = await NotificationService.findByUserId(userId);
      const unread = await NotificationService.countUnread(userId);
      res.render('pages/notification/index', {
        title: 'Thông báo',
        notifications: notifications.map((n) => n.toJSON()),
        unread,
        userId,
      });
    } catch (err) { next(err); }
  },

  async showKitchenNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.findKitchenNotifications();
      res.render('pages/notification/kitchen', {
        title: 'Bếp - Thông báo',
        notifications: notifications.map((n) => n.toJSON()),
      });
    } catch (err) { next(err); }
  },

  async markAllAsRead(req, res, next) {
    try {
      const userId = Number(req.body.userId || req.session?.authUser?.id || 1);
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async markAsRead(req, res, next) {
    try {
      const id = Number(req.params.id);
      await NotificationService.markAsRead(id);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // Simple webhook/test trigger
  async triggerEvent(req, res, next) {
    try {
      // Subject-based notifications are emitted from controllers/services; this is a placeholder
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
};

export default NotificationController;
