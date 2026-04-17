import express from 'express';
import { ManagerController } from '../controllers/manager.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả route yêu cầu MANAGER
router.use(authMiddleware.requireManager);

// Món ăn
router.get('/foods', ManagerController.showFoodsPage);
router.post('/foods', ManagerController.createFood);
router.patch('/foods/:id', ManagerController.updateFood);
router.delete('/foods/:id', ManagerController.deleteFood);

// Nhân viên
router.get('/staff', ManagerController.showStaffPage);
router.post('/staff', ManagerController.createStaff);
router.patch('/staff/:id', ManagerController.updateStaff);
router.delete('/staff/:id', ManagerController.deleteStaff);

export default router;
