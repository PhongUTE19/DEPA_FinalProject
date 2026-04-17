import { FoodService } from '../services/food/FoodService.js';

const FoodController = {

    // GET /menu
    // Render trang menu với danh sách tất cả món ăn
    async showMenuPage(req, res, next) {
        try {
            const foods = await FoodService.getAll();
            return res.render('pages/menu', {
                foods: foods.map(f => f.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /menu/:id?extraCheese=true&spicy=true&...
    // Trả JSON: Food domain (đã áp topping) 
    async showAddToppingPage(req, res, next) {
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

            const food = await FoodService.getWithToppings(req.params.id, options);
            if (!food) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy món' });
            }

            return res.json({ success: true, food: food.toJSON() });
        } catch (err) {
            next(err);
        }
    },

    // POST /menu — Manager tạo món mới
    async createFood(req, res, next) {
        try {
            const { name, basePrice, type, isAvailable, imageUrl, description } = req.body;
            if (!name || basePrice == null) {
                return res.status(400).json({ success: false, message: 'name và basePrice là bắt buộc' });
            }
            const food = await FoodService.create({ name, basePrice, type, isAvailable, imageUrl, description });
            return res.status(201).json({ success: true, food: food.toJSON() });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /menu/:id — Manager sửa món
    async updateFood(req, res, next) {
        try {
            const food = await FoodService.update(req.params.id, req.body);
            if (!food) return res.status(404).json({ success: false, message: 'Không tìm thấy món' });
            return res.json({ success: true, food: food.toJSON() });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /menu/:id — Manager xoá món
    async deleteFood(req, res, next) {
        try {
            await FoodService.remove(req.params.id);
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },
    // GET /menu/search?q=burger
// GET /menu?category=drink&priceMin=10&priceMax=50
async searchMenu(req, res, next) {
    try {
        const { q, category, priceMin, priceMax } = req.query;
        const foods = await FoodService.search({ q, category, priceMin, priceMax });
        return res.json({ success: true, foods: foods.map(f => f.toJSON()) });
    } catch (err) {
        next(err);
    }
},
};

export default FoodController;
