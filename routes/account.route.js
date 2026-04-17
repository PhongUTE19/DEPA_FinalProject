import express from 'express';
import AccountController from '../controllers/account.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/signup', AccountController.showSignupPage);
router.get('/signin', AccountController.showSigninPage);
router.get('/profile', authMiddleware.requireAuth, AccountController.showProfilePage);
router.get('/change-password', authMiddleware.requireAuth, AccountController.showChangePasswordPage);
router.get('/is-available', AccountController.isAvailable);

router.post('/signup', AccountController.signup);
router.post('/signin', AccountController.signin);
router.post('/signout', AccountController.signout);
router.post('/profile', authMiddleware.requireAuth, AccountController.updateProfile);
router.post('/change-password', authMiddleware.requireAuth, AccountController.updatePassword);

export default router;
