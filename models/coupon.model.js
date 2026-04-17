import db from '../config/database.js';

const TABLE = 'coupons';
const base = () => db(TABLE);

const CouponModel = {

    async create({ code, discountType, discountValue, minOrderAmount, maxUses, expiresAt }) {
        const [row] = await base()
            .insert({
                code: code.toUpperCase().trim(),
                discount_type: (discountType || 'PERCENT').toUpperCase(),
                discount_value: Number(discountValue) || 0,
                min_order_amount: Number(minOrderAmount) || 0,
                max_uses: maxUses == null ? null : Number(maxUses),
                used_count: 0,
                expires_at: expiresAt ?? null,
                is_active: true,
                created_at: new Date(),
            })
            .returning('*');
        return row;
    },

    async findByCode(code) {
        return base()
            .where({ code: code.toUpperCase().trim() })
            .first();
    },

    async findById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async findAvailable() {
        return base()
            .where({ is_active: true })
            .where(function () {
                this.whereNull('expires_at')
                    .orWhere('expires_at', '>', new Date());
            })
            .where(function () {
                this.whereNull('max_uses')
                    .orWhereRaw('used_count < max_uses');
            })
            .orderBy('created_at', 'desc');
    },

    async findAll() {
        return base().orderBy('created_at', 'desc');
    },

    async incrementUsedCount(id) {
        const [row] = await base()
            .where({ id: Number(id) })
            .increment('used_count', 1)
            .returning('*');
        return row;
    },

    async deactivate(id) {
        const [row] = await base()
            .where({ id: Number(id) })
            .update({ is_active: false })
            .returning('*');
        return row;
    },
};

export default CouponModel;
