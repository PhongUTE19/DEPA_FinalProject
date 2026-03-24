import express from 'express';
import courseController from '../controllers/course.controller.js';

const router = express.Router();

router.get('/list', courseController.showListPage);
router.get('/detail', courseController.showDetailPage);
router.get('/search', courseController.showListPageBySearch);

export default router;