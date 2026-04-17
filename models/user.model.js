/**
 * UserModel
 * Schema: users(id SERIAL, username, name, email, password, role, dob, created_at)
 * Cột 'permission' đã bị xoá — chỉ còn cột 'role' text.
 */
import db from '../config/database.js';

const TABLE = 'users';
const base  = () => db(TABLE);

const UserModel = {

    async findByUsername(username) {
        return base().where({ username }).first();
    },

    async findById(id) {
        return base().where({ id: Number(id) }).first();
    },

    async findAll({ role } = {}) {
        const q = base().orderBy('created_at', 'desc');
        if (role) q.where({ role });
        return q;
    },

    async add({ username, password, name, email, dob = null, role = 'CUSTOMER' }) {
        // Không có cột permission nữa
        return base().insert({ username, password, name, email, dob, role });
    },

    async edit(id, fields) {
        // Lọc bỏ 'permission' nếu ai đó vô tình truyền vào — cột đã xoá
        const { permission: _drop, ...safeFields } = fields;
        return base().where({ id: Number(id) }).update(safeFields);
    },

    async updateRole(id, role) {
        return base().where({ id: Number(id) }).update({ role });
    },
};

export default UserModel;
