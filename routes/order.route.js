import express from 'express';
import OrderController from '../controllers/order.controller.js';

const router = express.Router();

// REST under root
router.post('/order', OrderController.create);
router.patch('/order/status', OrderController.updateStatus);
router.get('/order/:id', OrderController.getById);

// API aliases expected by some views/scripts
router.get('/api/order/:id', OrderController.getById);
router.post('/api/order', OrderController.create);
router.patch('/api/order/status', OrderController.updateStatus);

export default router;
