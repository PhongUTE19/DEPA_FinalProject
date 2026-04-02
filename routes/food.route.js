import express from 'express';
import foodController from '../controllers/food.controller.js';

const router = express.Router();

// GET /menu
// Khách vào trang menu → lấy toàn bộ danh sách món ăn
router.get('/', foodController.getMenuPage);

// GET /menu/:id
// Khách chọn 1 món cụ thể → có thể thêm topping qua query string
// Ví dụ: /menu/1?extraCheese=true&spicy=true
router.get('/:id', foodController.getFoodWithToppingsPage);

export default router;