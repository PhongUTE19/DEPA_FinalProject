const requireAuth = (req, res, next) => {
    if (req.session?.isAuthenticated && req.session?.authUser) {
        return next();
    }
    req.session.retUrl = req.originalUrl;
    return res.redirect('/account/signin');
};

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
