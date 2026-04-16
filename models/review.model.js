import db from '../config/database.js';

const TABLE = 'reviews';
const base = () => db(TABLE);

const ReviewModel = {

    async getByFoodId(foodId) {
        return base()
            .join('users', 'reviews.user_id', 'users.id')
            .where({ 'reviews.food_id': Number(foodId) })
            .select('reviews.*', 'users.name as user_name')
            .orderBy('reviews.created_at', 'desc');
    },

    async create({ foodId, userId, rating, comment }) {
        const [row] = await base()
            .insert({
                food_id: Number(foodId),
                user_id: Number(userId),
                rating: Number(rating),
                comment: comment || null,
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