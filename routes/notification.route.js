import express from 'express';
import NotificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', NotificationController.showNotifications);
router.get('/kitchen', NotificationController.showKitchenNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/trigger', NotificationController.triggerEvent);

export default router;
