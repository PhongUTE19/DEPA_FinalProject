import express from 'express';
import accountController from '../controllers/account.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/signup', accountController.showSignupPage);
router.get('/signin', accountController.showSigninPage);
router.get('/profile', authMiddleware.requireAuth, accountController.showProfilePage);
router.get('/change-password', authMiddleware.requireAuth, accountController.showChangePasswordPage);
router.get('/is-available', accountController.isAvailable);

router.post('/signup', accountController.signup);
router.post('/signin', accountController.signin);
router.post('/signout', accountController.signout);
router.post('/profile', authMiddleware.requireAuth, accountController.updateProfile);
router.post('/change-password', authMiddleware.requireAuth, accountController.updatePassword);

export default router;