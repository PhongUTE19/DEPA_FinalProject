
import express from 'express';
import FoodController from '../controllers/food.controller.js';

const router = express.Router();

// GET /menu
// Khách vào trang menu → lấy toàn bộ danh sách món ăn
router.get('/', FoodController.getMenu);

// GET /menu/:id
// Khách chọn 1 món cụ thể → có thể thêm topping qua query string
// Ví dụ: /menu/1?extraCheese=true&spicy=true
router.get('/:id', FoodController.getFoodWithToppings);

export default router;