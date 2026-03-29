import express from 'express';
import PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Views (SSR) used by your Handlebars UI
router.get('/history', PaymentController.paymentHistory);
router.get('/:orderId', PaymentController.showPaymentPage);
router.post('/', PaymentController.processPayment);

// JSON API (used by fetch/AJAX or external clients)
router.post('/api', PaymentController.apiProcessPayment);

export default router;
