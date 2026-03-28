import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/history', authMiddleware.requireAuth, PaymentController.paymentHistory);
router.get('/:orderId', authMiddleware.requireAuth, PaymentController.showPaymentPage);
router.post('/', authMiddleware.requireAuth, PaymentController.processPayment);

// API Routes
router.post('/api', PaymentController.apiProcessPayment);

export default router;