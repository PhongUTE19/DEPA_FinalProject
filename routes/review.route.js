import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/food/:foodId', ReviewController.getByFood);
router.post('/food/:foodId', authMiddleware.requireAuth, ReviewController.create);
router.delete('/:id', authMiddleware.requireAuth, ReviewController.remove);

export default router;