import FavoriteModel from '../../models/favorite.model.js';
import FoodModel from '../../models/food.model.js';

export const FavoriteService = {
    async getByUserId(userId) {
        const favorites = await FavoriteModel.getByUserId(userId);
        const foodIds = favorites.map(f => f.food_id);
        if (foodIds.length === 0) return [];
        const foods = await FoodModel.getByIds(foodIds);
        return foods;
    },
    async add(userId, foodId) {
        const exists = await FavoriteModel.exists(userId, foodId);
        if (exists) throw new Error('Đã có trong danh sách yêu thích');
        return FavoriteModel.add(userId, foodId);
    },
    async remove(userId, foodId) {
        return FavoriteModel.remove(userId, foodId);
    },
};

export default FavoriteService;