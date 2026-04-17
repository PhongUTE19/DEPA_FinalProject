import bcrypt from 'bcryptjs';
import UserModel from '../../models/user.model.js';
import { User } from './User.js';

const AccountService = {

    async isAvailable(username) {
        const row = await UserModel.findByUsername(username);
        return !row;
    },

    async signup({ username, password, name, email, dob }) {
        const hashPassword = bcrypt.hashSync(password, 10);
        await UserModel.add({
            username,
            password: hashPassword,
            name,
            email,
            dob: dob || null,
            role: 'CUSTOMER',
        });
        const row = await UserModel.findByUsername(username);
        return User.fromRow(row);
    },

    async signin({ username, password }) {
        const row = await UserModel.findByUsername(username);
        if (!row) return { success: false };

        const match = bcrypt.compareSync(password, row.password);
        if (!match) return { success: false };

        return { success: true, user: User.fromRow(row) };
    },

    async updateProfile({ id, name, email }) {
        await UserModel.edit(id, { name, email });
        const row = await UserModel.findById(id);
        return User.fromRow(row);
    },

    async updatePassword({ id, currentPassword, newPassword }, sessionUser) {
        // Cần raw password để verify — lấy từ DB
        const row = await UserModel.findByUsername(sessionUser.username);
        const match = bcrypt.compareSync(currentPassword, row.password);
        if (!match) return { success: false };

        const hashPassword = bcrypt.hashSync(newPassword, 10);
        await UserModel.edit(id, { password: hashPassword });

        // Trả user domain mới (không chứa password)
        const updatedRow = await UserModel.findById(id);
        return { success: true, user: User.fromRow(updatedRow) };
    },
};

export default AccountService;
