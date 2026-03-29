

import FoodModel from '../../models/food.model.js';
import FoodFactory from './FoodFactory.js';
import { applyToppings } from './ToppingDecorator.js';

const FoodService = {

  // Lấy toàn bộ menu
  // Dùng Factory để tạo đúng loại object cho từng món
  async getMenu() {
    const rows = await FoodModel.getAll();
    return rows.map(row => FoodFactory.create(row.type, row).getInfo());
  },

  // Lấy 1 món + áp dụng topping nếu có
  // Dùng Factory + Decorator
  async getFoodWithToppings(id, options = {}) {
    const row = await FoodModel.getById(id);
    if (!row) return null;

    const food = FoodFactory.create(row.type, row);
    const decorated = applyToppings(food, options);
    return decorated.getInfo();
  },

};

export default FoodService;