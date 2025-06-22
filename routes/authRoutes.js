import express from 'express';
import authController from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middlewares/validationMiddleware.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/me', requireAuth, authController.getProfile);

export default router;
