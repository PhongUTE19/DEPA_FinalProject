/**
 * Auth Middleware
 *
 * requireAuth     — phải đăng nhập
 * requireRole     — phải có đúng role (hoặc MANAGER luôn qua)
 * requireStaff    — STAFF | MANAGER
 * requireManager  — chỉ MANAGER
 *
 * Session lưu authUser là User.toJSON() → có field `role` (UPPERCASE string).
 */

const requireAuth = (req, res, next) => {
    if (req.session?.isAuthenticated && req.session?.authUser) {
        return next();
    }
    req.session.retUrl = req.originalUrl;
    return res.redirect('/account/signin');
};

/**
 * Factory: tạo middleware kiểm tra role cụ thể.
 * MANAGER luôn có quyền.
 * @param {...string} allowedRoles - 'CUSTOMER' | 'STAFF' | 'MANAGER'
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.session?.isAuthenticated || !req.session?.authUser) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/account/signin');
    }
    const { role } = req.session.authUser;
    if (role === 'MANAGER' || allowedRoles.includes(role)) {
        return next();
    }
    return res.status(403).render('pages/error/403');
};

const requireStaff   = requireRole('STAFF', 'MANAGER');
const requireManager = requireRole('MANAGER');

export default {
    requireAuth,
    requireRole,
    requireStaff,
    requireManager,
};
