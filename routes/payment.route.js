import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Lịch sử thanh toán (phải đăng nhập)
router.get('/history', authMiddleware.requireAuth, PaymentController.showPaymentHistoryPage);

// Trang chọn phương thức (phải đăng nhập)
router.get('/:orderId', authMiddleware.requireAuth, PaymentController.showPaymentPage);

// Submit thanh toán SSR (phải đăng nhập)
router.post('/', authMiddleware.requireAuth, PaymentController.processPayment);

// JSON API (phải đăng nhập)
router.post('/api', authMiddleware.requireAuth, PaymentController.apiProcessPayment);

export default router;
