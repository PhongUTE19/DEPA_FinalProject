/**
 * UserModel — tầng DB duy nhất cho bảng 'users'
 *
 * Chỉ làm việc với raw rows.
 * KHÔNG import User domain class.
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
        return base().insert({ username, password, name, email, dob, role });
    },

    async edit(id, fields) {
        return base().where({ id: Number(id) }).update(fields);
    },

    async updateRole(id, role) {
        return base().where({ id: Number(id) }).update({ role });
    },
};

export default UserModel;
