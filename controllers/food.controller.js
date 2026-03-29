

import FoodService from '../services/food/food.service.js';

const FoodController = {

  // GET /menu
  async getMenu(req, res) {
    try {
      const foods = await FoodService.getMenu();
      return res.render('pages/menu', { foods });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lấy menu' });
    }
  },

  // GET /menu/:id?extraCheese=true&spicy=true
  async getFoodWithToppings(req, res) {
    try {
      const options = {
        extraCheese:  req.query.extraCheese  === 'true',
        extraSauce:   req.query.extraSauce   === 'true',
        noOnion:      req.query.noOnion      === 'true',
        extraMeat:    req.query.extraMeat    === 'true',
        spicy:        req.query.spicy        === 'true',
        extraVeggies: req.query.extraVeggies === 'true',
        noDressing:   req.query.noDressing   === 'true',
        extraIce:     req.query.extraIce     === 'true',
        noSugar:      req.query.noSugar      === 'true',
      };

      const food = await FoodService.getFoodWithToppings(req.params.id, options);
      if (!food) return res.status(404).json({ error: 'Không tìm thấy món' });

      return res.json(food);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lấy món ăn' });
    }
  },

};

export default FoodController;