import express from 'express';
import OrderController from '../controllers/order.controller.js';

const router = express.Router();

// REST under root
router.get('/order', OrderController.list);
router.post('/order', OrderController.create);
router.patch('/order/status', OrderController.updateStatus);
router.get('/order/:id', OrderController.getById);
router.post('/order/:id/cancel', OrderController.cancel);
router.post('/order/:id/reorder', OrderController.quickReorder);

// API aliases expected by some views/scripts
router.get('/api/order', OrderController.list);
router.get('/api/order/:id', OrderController.getById);
router.post('/api/order', OrderController.create);
router.patch('/api/order/status', OrderController.updateStatus);
router.post('/api/order/:id/cancel', OrderController.cancel);
router.post('/api/order/:id/reorder', OrderController.quickReorder);

export default router;
