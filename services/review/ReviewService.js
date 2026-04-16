import ReviewModel from '../../models/review.model.js';

export const ReviewService = {

    async getByFoodId(foodId) {
        return ReviewModel.getByFoodId(foodId);
    },

    async create({ foodId, userId, rating, comment }) {
        if (!rating || rating < 1 || rating > 5) {
            throw new Error('Rating phải từ 1 đến 5');
        }
        return ReviewModel.create({ foodId, userId, rating, comment });
    },

    async remove(id, userId, isManager = false) {
        const review = await ReviewModel.getById(id);
        if (!review) throw new Error('Không tìm thấy review');
        if (!isManager && review.user_id !== Number(userId)) {
            throw new Error('Không có quyền xoá review này');
        }
        return ReviewModel.remove(id);
    },
};

export default ReviewService;