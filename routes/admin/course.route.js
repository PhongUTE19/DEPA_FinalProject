import express from 'express';
import adminCourseController from '../../controllers/admin/course.controller.js';

const router = express.Router();

router.get('/list', adminCourseController.showListPage);
router.get('/add', adminCourseController.showAddPage);
router.get('/edit', adminCourseController.showEditPage);

router.post('/add', adminCourseController.add);
router.post('/edit', adminCourseController.edit);
router.post('/del', adminCourseController.del);

export default router;