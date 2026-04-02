/**
 * FoodModel — tầng DB duy nhất cho bảng 'foods'
 *
 * Chỉ làm việc với raw DB rows.
 * KHÔNG import bất kỳ domain class nào.
 * KHÔNG gọi từ Controller — phải qua FoodService.
 */
import db from '../config/database.js';

const TABLE = 'foods';
const base  = () => db(TABLE);

const FoodModel = {

    async getAll() {
        return base()
        // .where({ is_available: true })
        .orderBy('type').orderBy('name');
    },

    async getById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async getByIds(ids = []) {
        const normalized = [...new Set(ids.map(Number).filter(Number.isFinite))];
        if (normalized.length === 0) return [];
        return base().whereIn('id', normalized);
    },

    /** Manager: thêm món */
    async create({ name, basePrice, type = 'food', category = 'Khác', isAvailable = true, imageUrl = null, description = null }) {
        const [row] = await base()
            .insert({
                name,
                base_price:   Number(basePrice),
                type,
                category,
                is_available: Boolean(isAvailable),
                image_url:    imageUrl,
                description,
                created_at:   new Date(),
            })
            .returning('*');
        return row;
    },

    /** Manager: sửa món */
    async update(id, { name, basePrice, type, category, isAvailable, imageUrl, description }) {
        const fields = {};
        if (name        !== undefined) fields.name         = name;
        if (basePrice   !== undefined) fields.base_price   = Number(basePrice);
        if (type        !== undefined) fields.type         = type;
        if (category    !== undefined) fields.category     = category;
        if (isAvailable !== undefined) fields.is_available = Boolean(isAvailable);
        if (imageUrl    !== undefined) fields.image_url    = imageUrl;
        if (description !== undefined) fields.description  = description;

        if (Object.keys(fields).length === 0) return base().where({ id: Number(id) }).first();

        const [row] = await base()
            .where({ id: Number(id) })
            .update(fields)
            .returning('*');
        return row;
    },

    /** Manager: xoá món */
    async remove(id) {
        return base().where({ id: Number(id) }).delete();
    },
};

export default FoodModel;
