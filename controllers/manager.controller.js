import { FoodService } from '../services/food/FoodService.js';
import UserModel       from '../models/user.model.js';
import bcrypt          from 'bcryptjs';

export const ManagerController = {

    // GET /manager/foods — danh sách món ăn
    async showFoodsPage(req, res, next) {
        try {
            const foods = await FoodService.getAll();
            return res.render('pages/manager/foods', {
                title: 'Quản lý món ăn',
                foods: foods.map(f => f.toJSON()),
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /manager/foods — thêm món
    async createFood(req, res, next) {
        try {
            const { name, basePrice, type, isAvailable, imageUrl, description } = req.body;
            if (!name || basePrice == null) {
                return res.status(400).json({ success: false, message: 'name và basePrice là bắt buộc' });
            }
            const food = await FoodService.create({
                name, basePrice, type,
                isAvailable: isAvailable === 'true' || isAvailable === true,
                imageUrl, description,
            });
            return res.json({ success: true, food: food.toJSON() });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /manager/foods/:id — sửa món
    async updateFood(req, res, next) {
        try {
            const food = await FoodService.update(req.params.id, req.body);
            if (!food) return res.status(404).json({ success: false, message: 'Không tìm thấy món' });
            return res.json({ success: true, food: food.toJSON() });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /manager/foods/:id — xoá món
    async deleteFood(req, res, next) {
        try {
            await FoodService.remove(req.params.id);
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    // GET /manager/staff — danh sách nhân viên
    async showStaffPage(req, res, next) {
        try {
            const staffRows = await UserModel.findAll({ role: 'STAFF' });
            return res.render('pages/manager/staff', {
                title: 'Quản lý nhân viên',
                staffList: staffRows,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /manager/staff — thêm nhân viên
    async createStaff(req, res, next) {
        try {
            const { username, password, name, email, dob } = req.body;
            if (!username || !password || !name) {
                return res.status(400).json({ success: false, message: 'username, password và name là bắt buộc' });
            }
            const exists = await UserModel.findByUsername(username);
            if (exists) {
                return res.status(409).json({ success: false, message: 'Username đã tồn tại' });
            }
            const hashPassword = bcrypt.hashSync(password, 10);
            await UserModel.add({ username, password: hashPassword, name, email, dob: dob || null, role: 'STAFF' });
            const row = await UserModel.findByUsername(username);
            return res.json({ success: true, staff: { id: row.id, username: row.username, name: row.name, email: row.email, role: row.role } });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /manager/staff/:id — sửa nhân viên
    async updateStaff(req, res, next) {
        try {
            const { name, email, dob } = req.body;
            await UserModel.edit(req.params.id, { name, email, dob: dob || null });
            const row = await UserModel.findById(req.params.id);
            return res.json({ success: true, staff: { id: row.id, username: row.username, name: row.name, email: row.email } });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /manager/staff/:id — xoá nhân viên (hạ role về CUSTOMER)
    async deleteStaff(req, res, next) {
        try {
            // Không xoá user, chỉ hạ role để bảo toàn lịch sử đơn hàng
            await UserModel.updateRole(req.params.id, 'CUSTOMER');
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },
};
