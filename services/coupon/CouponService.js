import CouponModel from '../../models/coupon.model.js';
import { Coupon } from './Coupon.js';

export const CouponService = {
    async createCoupon({ code, discountType, discountValue, minOrderAmount, maxUses, expiresAt }) {
        const existing = await CouponModel.findByCode(code);
        if (existing) throw new Error('Mã giảm giá đã tồn tại');

        const row = await CouponModel.create({ code, discountType, discountValue, minOrderAmount, maxUses, expiresAt });
        return Coupon.fromRow(row);
    },

    async applyCoupon(code, orderAmount) {
        const row = await CouponModel.findByCode(code);
        if (!row) throw new Error('Mã giảm giá không tồn tại');

        const coupon = Coupon.fromRow(row);
        const { valid, reason } = coupon.isValid(orderAmount);
        if (!valid) throw new Error(reason);

        const discount = coupon.calculateDiscount(orderAmount);
        const finalAmount = orderAmount - discount;

        return { coupon: coupon.toJSON(), discount, finalAmount };
    },

    async markCouponUsed(code) {
        const row = await CouponModel.findByCode(code);
        if (!row) throw new Error('Mã giảm giá không tồn tại');
        await CouponModel.incrementUsedCount(row.id);
    },

    async getAvailableCoupons() {
        const rows = await CouponModel.findAvailable();
        return rows.map(Coupon.fromRow);
    },

    async getAllCoupons() {
        const rows = await CouponModel.findAll();
        return rows.map(Coupon.fromRow);
    },

    async findByCode(code) {
        const row = await CouponModel.findByCode(code);
        return row ? Coupon.fromRow(row) : null;
    },
};
