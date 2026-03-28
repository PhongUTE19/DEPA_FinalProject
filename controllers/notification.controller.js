﻿import NotificationModel from '../models/notification.model.js';

const NotificationController = {
  async showNotifications(req, res, next) {
    try {
      const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
      const notifications = await NotificationModel.findByUserId(userId);
      const unread = await NotificationModel.countUnread(userId);
      res.render('notification/index', { title: 'Notifications', notifications, unread, userId });
    } catch (err) { next(err); }
  },

  async showKitchenNotifications(req, res, next) {
    try {
      const notifications = await NotificationModel.findKitchenNotifications();
      res.render('notification/kitchen', { title: 'Kitchen - Notifications', notifications });
    } catch (err) { next(err); }
  },

  async markAllAsRead(req, res, next) {
    try {
      const userId = Number(req.body.userId || req.session?.authUser?.id || 1);
      await NotificationModel.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async markAsRead(req, res, next) {
    try {
      const id = Number(req.params.id);
      await NotificationModel.markAsRead(id);
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
