const injectAuthState = (req, res, next) => {
    if (req.session?.isAuthenticated && req.session?.authUser) {
        res.locals.isAuthenticated = true;
        res.locals.authUser = req.session.authUser;
        res.locals.userRole = req.session.authUser.role;
        res.locals.isManager = req.session.authUser.role === 'MANAGER';
        res.locals.isStaff = ['STAFF', 'MANAGER'].includes(req.session.authUser.role);
    } else {
        res.locals.isAuthenticated = false;
        res.locals.authUser = null;
        res.locals.userRole = null;
        res.locals.isManager = false;
        res.locals.isStaff = false;
    }
    next();
};

export default { injectAuthState };
