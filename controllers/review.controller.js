import { ReviewService } from '../services/review/ReviewService.js';

const ReviewController = {

    // GET /review/food/:foodId
    async getByFood(req, res, next) {
        try {
            const reviews = await ReviewService.getByFoodId(req.params.foodId);
            return res.json({ success: true, reviews });
        } catch (err) {
            next(err);
        }
    },

    // POST /review/food/:foodId
    async create(req, res, next) {
        try {
            const { rating, comment } = req.body;
            const review = await ReviewService.create({
                foodId:  req.params.foodId,
                userId:  req.session.authUser.id,
                rating,
                comment,
            });
            return res.status(201).json({ success: true, review });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /review/:id
    async remove(req, res, next) {
        try {
            const isManager = req.session.authUser?.role === 'MANAGER';
            await ReviewService.remove(req.params.id, req.session.authUser.id, isManager);
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },
};

export default ReviewController;