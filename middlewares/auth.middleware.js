const requireAuth = (req, res, next) => {
    if (req.session?.isAuthenticated) {
        return next();
    }

    req.session.retUrl = req.originalUrl;
    return res.redirect('/account/signin');
};

const requireAdmin = (req, res, next) => {
    if (!req.session?.authUser) {
        return res.redirect('/account/signin');
    }

    if (req.session.authUser.permission === 1) {
        return next();
    }
    return res.status(403).render('pages/error/403');
};

export default {
    requireAuth,
    requireAdmin,
};
