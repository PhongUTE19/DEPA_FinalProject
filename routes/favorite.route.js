import express from 'express';
import FavoriteController from '../controllers/favorite.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware.requireAuth, FavoriteController.getAll);
router.post('/:foodId', authMiddleware.requireAuth, FavoriteController.add);
router.delete('/:foodId', authMiddleware.requireAuth, FavoriteController.remove);

export default router;