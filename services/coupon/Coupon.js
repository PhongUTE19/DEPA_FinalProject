/**
 * Coupon Domain Object
 *
 * discount_type: 'PERCENT' | 'FIXED'
 * - PERCENT: giảm theo % tổng đơn
 * - FIXED: giảm số tiền cố định
 */

export const DISCOUNT_TYPE = Object.freeze({
    PERCENT: 'PERCENT',
    FIXED: 'FIXED',
});

export class Coupon {
    constructor({
        id = null,
        code,
        discountType = DISCOUNT_TYPE.PERCENT,
        discountValue = 0,
        minOrderAmount = 0,
        maxUses = null,
        usedCount = 0,
        expiresAt = null,
        isActive = true,
        createdAt = null,
    }) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = Number(discountValue) || 0;
        this.minOrderAmount = Number(minOrderAmount) || 0;
        this.maxUses = maxUses;
        this.usedCount = Number(usedCount) || 0;
        this.expiresAt = expiresAt;
        this.isActive = Boolean(isActive);
        this.createdAt = createdAt;
    }

    /** Kiểm tra coupon có hợp lệ không */
    isValid(orderAmount = 0) {
        if (!this.isActive) return { valid: false, reason: 'Mã giảm giá không còn hoạt động' };
        if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
            return { valid: false, reason: 'Mã giảm giá đã hết hạn' };
        }
        if (this.maxUses != null && this.usedCount >= this.maxUses) {
            return { valid: false, reason: 'Mã giảm giá đã hết lượt sử dụng' };
        }
        if (orderAmount < this.minOrderAmount) {
            return { valid: false, reason: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString('vi-VN')}₫` };
        }
        return { valid: true };
    }

    /** Tính số tiền được giảm */
    calculateDiscount(orderAmount) {
        const { valid } = this.isValid(orderAmount);
        if (!valid) return 0;

        if (this.discountType === DISCOUNT_TYPE.PERCENT) {
            return Math.round(orderAmount * this.discountValue / 100);
        }
        // FIXED
        return Math.min(this.discountValue, orderAmount);
    }

    static fromRow(row) {
        if (!row) return null;
        return new Coupon({
            id: row.id,
            code: row.code,
            discountType: (row.discount_type || 'PERCENT').toUpperCase(),
            discountValue: row.discount_value,
            minOrderAmount: row.min_order_amount,
            maxUses: row.max_uses,
            usedCount: row.used_count,
            expiresAt: row.expires_at,
            isActive: row.is_active ?? true,
            createdAt: row.created_at,
        });
    }

    toJSON() {
        return {
            id: this.id,
            code: this.code,
            discountType: this.discountType,
            discountValue: this.discountValue,
            minOrderAmount: this.minOrderAmount,
            maxUses: this.maxUses,
            usedCount: this.usedCount,
            expiresAt: this.expiresAt,
            isActive: this.isActive,
            createdAt: this.createdAt,
        };
    }
}
