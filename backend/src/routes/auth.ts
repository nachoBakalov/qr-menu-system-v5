/**
 * Authentication Routes
 * Маршрути за вход, изход и проверка на потребители
 */

import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { loginSchema } from '../utils/validation';

const router = Router();

// POST /api/auth/login - Вход в системата
router.post(
  '/login',
  validate(loginSchema, 'body'),
  authController.login
);

// GET /api/auth/me - Информация за текущия потребител
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/logout - Изход от системата
router.post('/logout', authenticate, authController.logout);

export default router;