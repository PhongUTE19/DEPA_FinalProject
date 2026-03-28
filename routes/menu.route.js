import express from 'express';
import MenuController from '../controllers/menu.controller.js';

const router = express.Router();
router.get('/menu', MenuController.list);
export default router;
