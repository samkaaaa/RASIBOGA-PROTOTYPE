import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createVideo,
  deleteVideo,
  getVideoById,
  listVideos,
  updateVideo,
} from '../controllers/videoController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { VIDEO_TYPES } from '../models/Video.js';

const router = Router();

const videoValidators = (isCreate = false) => [
  body('title').if(() => isCreate).trim().notEmpty().withMessage('Judul video wajib diisi'),
  body('title').optional().trim().isLength({ max: 180 }),
  body('type').optional().isIn(VIDEO_TYPES).withMessage('Tipe video tidak dikenal'),
  body('url').if(() => isCreate).trim().notEmpty().withMessage('URL video wajib diisi'),
  body('relatedFood').optional({ values: 'falsy' }).isMongoId().withMessage('Makanan terkait tidak valid'),
];

router.get('/', optionalAuth, listVideos);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, getVideoById);

router.post('/', protect, videoValidators(true), validate, createVideo);
router.put('/:id', protect, param('id').isMongoId(), videoValidators(false), validate, updateVideo);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteVideo);

export default router;
