/**
 * AccountService
 *
 * Xử lý đăng ký, đăng nhập, cập nhật hồ sơ.
 * Trả về User domain object — Controller không thao tác với raw DB row.
 */
import bcrypt    from 'bcryptjs';
import UserModel from '../../models/user.model.js';
import { User }  from './User.js';

const AccountService = {

    async isAvailable(username) {
        const row = await UserModel.findByUsername(username);
        return !row;
    },

    /**
     * Đăng ký tài khoản mới
     * @returns {User} domain object của user vừa tạo
     */
    async signup({ username, password, name, email, dob }) {
        const hashPassword = bcrypt.hashSync(password, 10);
        await UserModel.add({
            username,
            password: hashPassword,
            name,
            email,
            dob:  dob || null,
            role: 'CUSTOMER',       // Mặc định CUSTOMER khi đăng ký
        });
        const row = await UserModel.findByUsername(username);
        return User.fromRow(row);
    },

    /**
     * Đăng nhập
     * @returns {{ success: boolean, user?: User }}
     */
    async signin({ username, password }) {
        const row = await UserModel.findByUsername(username);
        if (!row) return { success: false };

        const match = bcrypt.compareSync(password, row.password);
        if (!match) return { success: false };

        return { success: true, user: User.fromRow(row) };
    },

    /**
     * Cập nhật hồ sơ
     * @returns {User} domain object đã cập nhật
     */
    async updateProfile({ id, name, email }) {
        await UserModel.edit(id, { name, email });
        const row = await UserModel.findById(id);
        return User.fromRow(row);
    },

    /**
     * Đổi mật khẩu
     * @param {User} sessionUser - User domain từ session
     * @returns {{ success: boolean, user?: User }}
     */
    async updatePassword({ id, currentPassword, newPassword }, sessionUser) {
        // Cần raw password để verify — lấy từ DB
        const row   = await UserModel.findByUsername(sessionUser.username);
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
