import { FoodFactory } from '../services/food/FoodFactory.js';

const factory = new FoodFactory();

const MenuController = {
  // GET /menu — return minimal list
  list(req, res) {
    const foods = factory.list().map(f => ({ id: f.id, name: f.name, price: f.price }));
    res.json(foods);
  }
};

export default MenuController;
