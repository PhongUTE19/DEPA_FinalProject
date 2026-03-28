import FoodModel from '../models/food.model.js';
import FoodFactory from '../services/Food/FoodFactory.js'
import { applyToppings } from '../services/Food/ToppingDecorator.js';

const FoodController = {

  // GET /menu
  // Khách vào xem menu → trả về danh sách tất cả món ăn
  async getMenu(req, res) {
    try {
      // 1. Lấy danh sách món từ database
      const rows = await FoodModel.getAll();

      // 2. Dùng Factory tạo đúng loại object cho từng món
      //    (Pizza ra Pizza, Drink ra Drink, ...)
      const foods = rows.map(row => {
        const food = FoodFactory.create(row.type, row);
        return food.getInfo();
      });

      // 3. Trả về cho client
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
      // 1. Tìm món theo id trong database
      const row = await FoodModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Không tìm thấy món' });

      // 2. Dùng Factory tạo object đúng loại
      const food = FoodFactory.create(row.type, row);

      // 3. Đọc topping khách chọn từ URL
      //    Ví dụ: /menu/1?extraCheese=true&spicy=true
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

      // 4. Dùng Decorator bọc thêm các topping khách chọn
      const decorated = applyToppings(food, options);

      // 5. Trả về món đã tùy chỉnh (tên + giá đã cộng topping)
      return res.json(decorated.getInfo());

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lấy món ăn' });
    }
  },

};

export default FoodController;