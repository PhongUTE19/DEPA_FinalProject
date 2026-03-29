import accountService from '../services/account.service.js';

const showSignupPage = (req, res) => {
    res.render('pages/account/signup');
};

const showSigninPage = (req, res) => {
    res.render('pages/account/signin');
};

const showProfilePage = (req, res) => {
    res.render('pages/account/profile', {
        user: req.session.authUser
    });
};

const showChangePasswordPage = (req, res) => {
    res.render('pages/account/change-password', {
        user: req.session.authUser
    });
};

const isAvailable = async (req, res) => {
    const available = await accountService.isAvailable(req.query.username);
    res.json(available);
};

const signup = async (req, res) => {
    await accountService.signup(req.body);
    res.render('pages/account/signin');
};

const signin = async (req, res) => {
    const result = await accountService.signin(req.body);

    if (!result.success) {
        return res.render('pages/account/signin', {
            error: true
        });
    }

    req.session.isAuthenticated = true;
    req.session.authUser = result.user;

    const retUrl = req.session.retUrl || '/';
    delete req.session.retUrl;
    res.redirect(retUrl);
};

const signout = (req, res) => {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect(req.headers.referer);
};

const updateProfile = async (req, res) => {
    const user = await accountService.updateProfile(req.body);
    req.session.authUser = { ...req.session.authUser, ...user };

    res.render('pages/account/profile', {
        user: req.session.authUser
    });
};

const updatePassword = async (req, res) => {
    const success = await accountService.updatePassword(req.body, req.session.authUser);

    if (!success) {
        return res.render('pages/account/change-password', {
            user: req.session.authUser,
            error: true
        });
    }

    res.render('pages/account/change-password', {
        user: req.session.authUser,
        success: true
    });
};

export default {
    showSignupPage,
    showSigninPage,
    showProfilePage,
    showChangePasswordPage,
    isAvailable,
    signup,
    signin,
    signout,
    updateProfile,
    updatePassword
};
