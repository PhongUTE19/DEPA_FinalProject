import express from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = express.Router();

// GET /order — trang danh sách đơn (SSR)
router.get('/', OrderController.ordersPage);
// GET /order/:id — lấy đơn (JSON, domain)
router.get('/:id', OrderController.getOrder);
// POST /order — tạo đơn (JSON)
router.post('/', OrderController.createOrder);
// PATCH /order/status
router.patch('/status', OrderController.updateStatus);

export default router;