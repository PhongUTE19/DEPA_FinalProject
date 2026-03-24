import express from 'express';
import adminCategoryController from '../../controllers/admin/category.controller.js';

const router = express.Router();

router.get('/list', adminCategoryController.showListPage);
router.get('/add', adminCategoryController.showAddPage);
router.get('/edit', adminCategoryController.showEditPage);

router.post('/add', adminCategoryController.add);
router.post('/edit', adminCategoryController.edit);
router.post('/del', adminCategoryController.del);

export default router;