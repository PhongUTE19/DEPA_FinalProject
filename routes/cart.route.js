import express        from 'express';
import CartController from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/',              CartController.showCartPage);
router.post('/add',          CartController.addItem);
router.patch('/update',      CartController.updateItem);
router.delete('/remove/:id', CartController.removeItem);
router.delete('/clear',      CartController.clearCart);
router.post('/checkout',     CartController.checkout);

export default router;