import express             from 'express';
import { OrderController } from '../controllers/order.controller.js';
import authMiddleware      from '../middlewares/auth.middleware.js';

const router = express.Router();

// List & tracking pages
router.get('/',                  authMiddleware.requireAuth,   OrderController.showOrdersPage);
router.get('/:id/tracking',      authMiddleware.requireAuth,   OrderController.showTrackingPage);
router.get('/:id/status',        authMiddleware.requireAuth,   OrderController.getOrderStatus);

// JSON detail
router.get('/:id',               authMiddleware.requireAuth,   OrderController.showOrderPage);

// Mutations — NOTE: /status and /cancel must come before /:id to avoid route conflict
router.post('/',                 authMiddleware.requireAuth,   OrderController.createOrder);
router.patch('/status',          authMiddleware.requireStaff,  OrderController.updateStatus);
router.patch('/cancel',          authMiddleware.requireAuth,   OrderController.cancelOrder);

export default router;