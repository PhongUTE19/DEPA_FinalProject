﻿import { sharedFoodFactory as factory } from '../services/food/food.factory.js';

const MenuController = {
  // GET /menu — return minimal list
  list(req, res) {
    const foods = factory.list().map(f => ({ id: f.id, name: f.name, price: f.price }));
    res.json(foods);
  },

  // POST /menu/preview — Alternate Flow: Preview customized item before adding to cart
  preview(req, res, next) {
    try {
      const { type, options = [] } = req.body;
      let food = factory.create(type);
      // Dynamically wraps/unwraps by applying the exact array from scratch
      food = factory.applyOptions(food, options);
      res.json({ name: food.name, price: food.price });
    } catch (err) { next(err); }
  }
};

export default MenuController;
