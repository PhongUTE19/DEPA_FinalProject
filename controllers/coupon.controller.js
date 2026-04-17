import { CouponService } from '../services/coupon/CouponService.js';

const CouponController = {

    // POST /coupon/apply — áp dụng mã giảm giá (JSON API)
    async applyCoupon(req, res, next) {
        try {
            const { code, orderAmount } = req.body;
            if (!code || orderAmount == null) {
                return res.status(400).json({ success: false, message: 'Thiếu mã giảm giá hoặc số tiền đơn hàng' });
            }

            const result = await CouponService.applyCoupon(code, Number(orderAmount));
            return res.json({ success: true, ...result });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    // GET /coupon/available — danh sách mã khả dụng (SSR)
    async showAvailableCoupons(req, res, next) {
        try {
            const coupons = await CouponService.getAvailableCoupons();
            return res.render('pages/coupon/available', {
                title: 'Mã giảm giá',
                coupons: coupons.map(c => c.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /coupon/create — form tạo mã (Manager SSR)
    async showCreateForm(req, res, next) {
        try {
            return res.render('pages/coupon/create', {
                title: 'Tạo mã giảm giá',
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /coupon/create — tạo mã giảm giá (Manager)
    async createCoupon(req, res, next) {
        try {
            const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

            if (!code || !discountValue) {
                return res.render('pages/coupon/create', {
                    title: 'Tạo mã giảm giá',
                    error: 'Vui lòng nhập mã và giá trị giảm',
                    formData: req.body,
                });
            }

            const coupon = await CouponService.createCoupon({
                code,
                discountType: discountType || 'PERCENT',
                discountValue: Number(discountValue),
                minOrderAmount: Number(minOrderAmount) || 0,
                maxUses: maxUses ? Number(maxUses) : null,
                expiresAt: expiresAt || null,
            });

            return res.render('pages/coupon/create', {
                title: 'Tạo mã giảm giá',
                success: `Đã tạo mã "${coupon.code}" thành công!`,
                coupon: coupon.toJSON(),
            });
        } catch (err) {
            return res.render('pages/coupon/create', {
                title: 'Tạo mã giảm giá',
                error: err.message,
                formData: req.body,
            });
        }
    },

    // GET /coupon/manage — quản lý tất cả coupon (Manager SSR)
    async showManagePage(req, res, next) {
        try {
            const coupons = await CouponService.getAllCoupons();
            return res.render('pages/coupon/manage', {
                title: 'Quản lý mã giảm giá',
                coupons: coupons.map(c => c.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },
};

export default CouponController;
