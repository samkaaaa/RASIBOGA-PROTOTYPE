import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param } from 'express-validator';
import {
  createSubmission,
  listSubmissions,
  updateSubmissionStatus,
} from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';
import { uploadMany } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { SUBMISSION_TYPES } from '../models/CommunitySubmission.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Batas kontribusi tercapai. Coba lagi nanti.' },
});

router.post(
  '/submissions',
  submitLimiter,
  uploadMany('media', 3),
  body('type').isIn(SUBMISSION_TYPES).withMessage('Jenis kontribusi tidak dikenal'),
  body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Format email tidak valid'),
  body('title').trim().notEmpty().withMessage('Judul wajib diisi').isLength({ max: 200 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Deskripsi wajib diisi')
    .isLength({ max: 6000 })
    .withMessage('Deskripsi maksimal 6000 karakter'),
  validate,
  createSubmission
);

router.get('/submissions', protect, listSubmissions);

router.patch(
  '/submissions/:id/status',
  protect,
  param('id').isMongoId().withMessage('ID kontribusi tidak valid'),
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Status tidak valid'),
  body('adminNote').optional().isLength({ max: 2000 }),
  validate,
  updateSubmissionStatus
);

export default router;
