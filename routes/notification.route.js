import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// User xem thông báo của mình
router.get('/', NotificationController.showNotificationsPage);

// Staff / Chef / Manager xem thông báo bếp
router.get('/kitchen', NotificationController.showKitchenNotifications);

// Đánh dấu đã đọc
router.patch('/read-all', authMiddleware.requireAuth, NotificationController.markAllAsRead);
router.patch('/:id/read', authMiddleware.requireAuth, NotificationController.markAsRead);

// Chi tiết thông báo
router.get('/:id', authMiddleware.requireAuth, NotificationController.showNotificationDetail);

// Dev-only test hook
router.post('/trigger', NotificationController.triggerEvent);

export default router;
