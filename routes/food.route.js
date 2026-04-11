import express        from 'express';
import FoodController from '../controllers/food.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', FoodController.showMenuPage);
router.get('/search', FoodController.searchMenu);
router.get('/:id', FoodController.showAddToppingPage);

// Manager only — quản lý món ăn
router.post('/',       authMiddleware.requireManager, FoodController.createFood);
router.patch('/:id',   authMiddleware.requireManager, FoodController.updateFood);
router.delete('/:id',  authMiddleware.requireManager, FoodController.deleteFood);

export default router;
