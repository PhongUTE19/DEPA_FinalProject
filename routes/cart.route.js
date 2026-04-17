import express from 'express';
import CartController from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware.requireAuth, CartController.showCartPage);
router.post('/add', authMiddleware.requireAuth, CartController.addItem);
router.patch('/update', authMiddleware.requireAuth, CartController.updateItem);
router.delete('/remove/:id', authMiddleware.requireAuth, CartController.removeItem);
router.delete('/clear', authMiddleware.requireAuth, CartController.clearCart);
router.post('/checkout', authMiddleware.requireAuth, CartController.checkout);

export default router;