import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware.requireAuth, NotificationController.showNotificationsPage);
router.get('/:id', authMiddleware.requireAuth, NotificationController.showNotificationDetail);
router.get('/kitchen', authMiddleware.requireStaff, NotificationController.showKitchenNotifications);

router.patch('/read-all', authMiddleware.requireAuth, NotificationController.markAllAsRead);
router.patch('/:id/read', authMiddleware.requireAuth, NotificationController.markAsRead);

export default router;
