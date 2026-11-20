import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { login, logout, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan masuk. Coba lagi nanti.' },
});

router.post(
  '/login',
  loginLimiter,
  body('email').trim().isEmail().withMessage('Format email tidak valid'),
  body('password').isString().isLength({ min: 8 }).withMessage('Kata sandi minimal 8 karakter'),
  validate,
  login
);

router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
