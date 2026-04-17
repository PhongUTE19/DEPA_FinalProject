import express from 'express';
import { StaffController } from '../controllers/staff.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả route yêu cầu ít nhất STAFF
router.use(authMiddleware.requireStaff);

router.get('/',                  StaffController.showOrdersPage);
router.patch('/order/status',    StaffController.advanceStatus);
router.patch('/order/cancel',    StaffController.cancelOrder);

export default router;
