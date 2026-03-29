import foodModel from '../models/food.model.js';
import FoodFactory from '../services/food/FoodFactory.js'
import { applyToppings } from '../services/food/ToppingDecorator.js';

const FoodController = {

  // GET /menu
  // Khách vào xem menu → trả về danh sách tất cả món ăn
  async getMenu(req, res) {
    try {
      const rows = await foodModel.getAll();
      const foods = rows.map(row => {
        const food = FoodFactory.create(row.type, row);
        return food.getInfo();
      });

      return res.render('pages/menu', { foods });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lấy menu' });
    }
  },

  // GET /menu/:id?extraCheese=true&spicy=true&noOnion=true
  // Khách chọn 1 món cụ thể + chọn topping → trả về món đã tùy chỉnh
  async getFoodWithToppings(req, res) {
    try {
      const row = await foodModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Không tìm thấy món' });

      const food = FoodFactory.create(row.type, row);

      const options = {
        extraCheese: req.query.extraCheese === 'true',
        extraSauce: req.query.extraSauce === 'true',
        noOnion: req.query.noOnion === 'true',
        extraMeat: req.query.extraMeat === 'true',
        spicy: req.query.spicy === 'true',
        extraVeggies: req.query.extraVeggies === 'true',
        noDressing: req.query.noDressing === 'true',
        extraIce: req.query.extraIce === 'true',
        noSugar: req.query.noSugar === 'true',
      };

      const decorated = applyToppings(food, options);

      return res.json(decorated.getInfo());

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lấy món ăn' });
    }
  },

};

export default FoodController;