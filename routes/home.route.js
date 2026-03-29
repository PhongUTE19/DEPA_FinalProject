import express from 'express';
import homeController from '../controllers/home.controller.js';

const router = express.Router();

router.get('/', homeController.showHomePage);
router.get('/faqs', homeController.showFaqsPage);
router.get('/about', homeController.showAboutPage);

export default router;
