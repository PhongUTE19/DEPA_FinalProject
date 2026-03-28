// ===================================================
// ROUTES — Notification
// ===================================================

import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// UI Routes
router.get('/', authMiddleware.requireAuth, NotificationController.showNotifications);
router.get('/kitchen', NotificationController.showKitchenNotifications);

// QUAN TRỌNG: /read-all phải đặt TRƯỚC /:id/read
router.patch('/read-all', authMiddleware.requireAuth, NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

// Test trigger (dev only)
router.post('/trigger', NotificationController.triggerEvent);

export default router;