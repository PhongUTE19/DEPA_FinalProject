import express from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = express.Router();

// GET /order
router.get('/', OrderController.createOrder);
// POST /order
router.post('/', OrderController.createOrder);
// PATCH /order/status
router.patch('/status', OrderController.updateStatus);

export default router;