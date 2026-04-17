import express from 'express';
import CouponController from '../controllers/coupon.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Danh sách mã giảm giá khả dụng (phải đăng nhập)
router.get('/available', authMiddleware.requireAuth, CouponController.showAvailableCoupons);

// Áp dụng mã giảm giá (JSON API, phải đăng nhập)
router.post('/apply', authMiddleware.requireAuth, CouponController.applyCoupon);

// Form tạo mã giảm giá (Manager SSR)
router.get('/create', authMiddleware.requireManager, CouponController.showCreateForm);
router.post('/create', authMiddleware.requireManager, CouponController.createCoupon);

// Quản lý tất cả coupon (Manager)
router.get('/manage', authMiddleware.requireManager, CouponController.showManagePage);

export default router;
