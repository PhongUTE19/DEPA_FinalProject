/**
 * CouponService
 *
 * Điểm vào duy nhất cho mọi thao tác Coupon.
 * Controller chỉ gọi CouponService — KHÔNG gọi CouponModel trực tiếp.
 */
import CouponModel from '../../models/coupon.model.js';
import { Coupon } from './Coupon.js';

export const CouponService = {

    /** Tạo coupon mới (Manager only) → Coupon domain */
    async createCoupon({ code, discountType, discountValue, minOrderAmount, maxUses, expiresAt }) {
        // Kiểm tra trùng code
        const existing = await CouponModel.findByCode(code);
        if (existing) throw new Error('Mã giảm giá đã tồn tại');

        const row = await CouponModel.create({ code, discountType, discountValue, minOrderAmount, maxUses, expiresAt });
        return Coupon.fromRow(row);
    },

    /** Áp dụng coupon vào đơn hàng → { coupon, discount, finalAmount } */
    async applyCoupon(code, orderAmount) {
        const row = await CouponModel.findByCode(code);
        if (!row) throw new Error('Mã giảm giá không tồn tại');

        const coupon = Coupon.fromRow(row);
        const { valid, reason } = coupon.isValid(orderAmount);
        if (!valid) throw new Error(reason);

        const discount = coupon.calculateDiscount(orderAmount);
        const finalAmount = orderAmount - discount;

        // Không increment ở đây - chỉ return discount
        // incrementUsedCount sẽ được gọi sau khi thanh toán SUCCESS

        return { coupon: coupon.toJSON(), discount, finalAmount };
    },

    /** Increment used_count khi thanh toán thành công */
    async markCouponUsed(code) {
        const row = await CouponModel.findByCode(code);
        if (!row) throw new Error('Mã giảm giá không tồn tại');
        await CouponModel.incrementUsedCount(row.id);
    },

    /** Lấy danh sách coupon khả dụng → Coupon domain[] */
    async getAvailableCoupons() {
        const rows = await CouponModel.findAvailable();
        return rows.map(Coupon.fromRow);
    },

    /** Lấy tất cả coupon (Manager) → Coupon domain[] */
    async getAllCoupons() {
        const rows = await CouponModel.findAll();
        return rows.map(Coupon.fromRow);
    },

    /** Lấy coupon theo code → Coupon domain */
    async findByCode(code) {
        const row = await CouponModel.findByCode(code);
        return row ? Coupon.fromRow(row) : null;
    },
};
