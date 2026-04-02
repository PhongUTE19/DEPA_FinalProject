/**
 * AccountController
 *
 * Chỉ nhận req → gọi AccountService → lưu User domain vào session → trả res.
 * Session lưu user.toJSON() (plain object, an toàn, không có password).
 * KHÔNG import UserModel trực tiếp.
 */
import AccountService from '../services/account/AccountService.js';

const AccountController = {

    showSignupPage(req, res) {
        res.render('pages/account/signup');
    },

    showSigninPage(req, res) {
        res.render('pages/account/signin');
    },

    showProfilePage(req, res) {
        res.render('pages/account/profile', { user: req.session.authUser });
    },

    showChangePasswordPage(req, res) {
        res.render('pages/account/change-password', { user: req.session.authUser });
    },

    async isAvailable(req, res) {
        const available = await AccountService.isAvailable(req.query.username);
        res.json(available);
    },

    async signup(req, res, next) {
        try {
            await AccountService.signup(req.body);
            res.render('pages/account/signin', { message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
        } catch (err) {
            next(err);
        }
    },

    async signin(req, res, next) {
        try {
            const result = await AccountService.signin(req.body);
            if (!result.success) {
                return res.render('pages/account/signin', { error: true });
            }

            // Lưu User domain (plain JSON) vào session — KHÔNG lưu raw DB row
            req.session.isAuthenticated = true;
            req.session.authUser        = result.user.toJSON();

            const retUrl = req.session.retUrl || '/';
            delete req.session.retUrl;
            return res.redirect(retUrl);
        } catch (err) {
            next(err);
        }
    },

    signout(req, res) {
        req.session.isAuthenticated = false;
        req.session.authUser        = null;
        res.redirect('/');
    },

    async updateProfile(req, res, next) {
        try {
            const id   = req.session.authUser?.id;
            const user = await AccountService.updateProfile({ id, ...req.body });

            // Cập nhật lại session với domain object mới
            req.session.authUser = user.toJSON();

            res.render('pages/account/profile', { user: req.session.authUser, success: true });
        } catch (err) {
            next(err);
        }
    },

    async updatePassword(req, res, next) {
        try {
            const id     = req.session.authUser?.id;
            const result = await AccountService.updatePassword(
                { id, ...req.body },
                req.session.authUser,
            );

            if (!result.success) {
                return res.render('pages/account/change-password', {
                    user:  req.session.authUser,
                    error: true,
                });
            }

            // Cập nhật session với user domain mới
            req.session.authUser = result.user.toJSON();

            res.render('pages/account/change-password', {
                user:    req.session.authUser,
                success: true,
            });
        } catch (err) {
            next(err);
        }
    },
};

export default AccountController;
