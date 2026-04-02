import express             from 'express';
import { OrderController } from '../controllers/order.controller.js';
import authMiddleware      from '../middlewares/auth.middleware.js';

const router = express.Router();

// Xem danh sách đơn (Customer xem của mình, Staff/Chef/Manager xem tất cả)
router.get('/', authMiddleware.requireAuth, OrderController.showOrdersPage);

// Lấy chi tiết 1 đơn (JSON)
router.get('/:id', authMiddleware.requireAuth, OrderController.showOrderPage);

// Customer tạo đơn
router.post('/', authMiddleware.requireAuth, OrderController.createOrder);

// Staff / Chef / Manager chuyển trạng thái kế tiếp
router.patch('/status', authMiddleware.requireStaff, OrderController.updateStatus);

// Customer / Staff / Manager huỷ đơn
router.patch('/cancel', authMiddleware.requireAuth, OrderController.cancelOrder);

export default router;
