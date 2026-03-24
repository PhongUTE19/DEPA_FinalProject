import categoryModel from '../models/category.model.js';

const injectGlobals = async (req, res, next) => {
    res.locals.global_categories = await categoryModel.findAll();
    next();
};

const injectAuthState = (req, res, next) => {
    if (req.session?.isAuthenticated) {
        res.locals.isAuthenticated = true;
        res.locals.authUser = req.session.authUser;
    } else {
        res.locals.isAuthenticated = false;
        res.locals.authUser = null;
    }
    next();
};

export default {
    injectGlobals,
    injectAuthState,
};
