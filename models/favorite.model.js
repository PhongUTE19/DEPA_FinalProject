import db from '../config/database.js';

const TABLE = 'favorites';
const base  = () => db(TABLE);

const FavoriteModel = {
    async getByUserId(userId) {
        return base().where({ user_id: Number(userId) }).orderBy('created_at', 'desc');
    },
    async add(userId, foodId) {
        const [row] = await base()
            .insert({ user_id: Number(userId), food_id: Number(foodId), created_at: new Date() })
            .returning('*');
        return row;
    },
    async remove(userId, foodId) {
        return base().where({ user_id: Number(userId), food_id: Number(foodId) }).delete();
    },
    async exists(userId, foodId) {
        const row = await base().where({ user_id: Number(userId), food_id: Number(foodId) }).first();
        return !!row;
    },
};

export default FavoriteModel;