import db from '../config/database.js';

const TABLE = 'reviews';
const base  = () => db(TABLE);

const ReviewModel = {

    async getByFoodId(foodId) {
        return base()
            .where({ food_id: Number(foodId) })
            .orderBy('created_at', 'desc');
    },

    async create({ foodId, userId, rating, comment }) {
        const [row] = await base()
            .insert({
                food_id:    Number(foodId),
                user_id:    Number(userId),
                rating:     Number(rating),
                comment:    comment || null,
                created_at: new Date(),
            })
            .returning('*');
        return row;
    },

    async remove(id) {
        return base().where({ id: Number(id) }).delete();
    },

    async getById(id) {
        return base().where({ id: Number(id) }).first();
    },
};

export default ReviewModel;