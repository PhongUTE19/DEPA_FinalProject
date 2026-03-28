﻿import express from 'express';
import MenuController from '../controllers/menu.controller.js';

const router = express.Router();
router.get('/menu', MenuController.list);
router.post('/menu/preview', MenuController.preview);

export default router;
