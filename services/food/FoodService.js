/**
 * FoodService
 *
 * Layer duy nhất giữa Controller và FoodModel.
 * Controller KHÔNG được import FoodModel trực tiếp.
 *
 * Luồng:
 *   FoodModel.getAll() → raw rows
 *   → Food.fromRow(row) → Food domain
 *   → FoodFactory.create(food) → typed subclass (Pizza, Burger…)
 *   → [applyToppings nếu cần] → trả domain ra Controller
 */
import FoodModel from '../../models/food.model.js';
import { Food }  from './Food.js';
import { FoodFactory } from './FoodFactory.js';
import { applyToppings } from './ToppingDecorator.js';

export const FoodService = {

    /** Lấy toàn bộ menu → mảng Food domain */
    async getAll() {
        const rows = await FoodModel.getAll();
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    },

    /** Lấy 1 món theo id → Food domain (hoặc null) */
    async getById(id) {
        const row = await FoodModel.getById(id);
        if (!row) return null;
        return FoodFactory.create(Food.fromRow(row));
    },

    /** Lấy nhiều món theo danh sách id → Map<id, Food domain> */
    async getByIds(ids = []) {
        const rows  = await FoodModel.getByIds(ids);
        const foods = rows.map(row => FoodFactory.create(Food.fromRow(row)));
        return new Map(foods.map(f => [Number(f.id), f]));
    },

    /**
     * Lấy 1 món + áp dụng topping options
     */
    async getWithToppings(id, options = {}) {
        const food = await this.getById(id);
        if (!food) return null;
        return applyToppings(food, options);
    },

    /** Tạo món mới (Manager) */
    async create({ name, basePrice, type, isAvailable, imageUrl, description }) {
        const row = await FoodModel.create({ name, basePrice, type, isAvailable, imageUrl, description });
        return FoodFactory.create(Food.fromRow(row));
    },

    /** Cập nhật món (Manager) */
    async update(id, { name, basePrice, type, isAvailable, imageUrl, description }) {
        const row = await FoodModel.update(id, { name, basePrice, type, isAvailable, imageUrl, description });
        if (!row) return null;
        return FoodFactory.create(Food.fromRow(row));
    },

    /** Xoá món (Manager) */
    async remove(id) {
        return FoodModel.remove(id);
    },
};

export default FoodService;
