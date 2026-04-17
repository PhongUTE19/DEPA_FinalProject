import FoodModel from '../../models/food.model.js';
import { Food }  from './Food.js';
import { FoodFactory } from './FoodFactory.js';
import { applyToppings } from './ToppingDecorator.js';

class FoodServiceClass {
    static #instance = null;

    static getInstance() {
        if (!FoodServiceClass.#instance) {
            FoodServiceClass.#instance = new FoodServiceClass();
        }
        return FoodServiceClass.#instance;
    }

    async getAll() {
        const rows = await FoodModel.getAll();
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    }

    async getFeatured(limit = 6) {
        const rows = await FoodModel.getFeatured(limit);
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    }

    async getBestSellers(limit = 6) {
        const rows = await FoodModel.getBestSellers(limit);
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    }

    async getNewest(limit = 6) {
        const rows = await FoodModel.getNewest(limit);
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    }

    async getById(id) {
        const row = await FoodModel.getById(id);
        if (!row) return null;
        return FoodFactory.create(Food.fromRow(row));
    }

    async getByIds(ids = []) {
        const rows  = await FoodModel.getByIds(ids);
        const foods = rows.map(row => FoodFactory.create(Food.fromRow(row)));
        return new Map(foods.map(f => [Number(f.id), f]));
    }

    async getWithToppings(id, options = {}) {
        const food = await this.getById(id);
        if (!food) return null;
        return applyToppings(food, options);
    }

    async create({ name, basePrice, type, isAvailable, imageUrl, description }) {
        const row = await FoodModel.create({ name, basePrice, type, isAvailable, imageUrl, description });
        return FoodFactory.create(Food.fromRow(row));
    }

    async update(id, { name, basePrice, type, isAvailable, imageUrl, description }) {
        const row = await FoodModel.update(id, { name, basePrice, type, isAvailable, imageUrl, description });
        if (!row) return null;
        return FoodFactory.create(Food.fromRow(row));
    }

    async remove(id) {
        return FoodModel.remove(id);
    }

    async search({ q, category, priceMin, priceMax }) {
        const rows = await FoodModel.search({ q, category, priceMin, priceMax });
        return rows.map(row => FoodFactory.create(Food.fromRow(row)));
    }
}

export const FoodService = FoodServiceClass.getInstance();
export default FoodService;
