import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createFood,
  deleteFood,
  getFoodById,
  getFoodBySlug,
  listFoods,
  updateFood,
} from '../controllers/foodController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { FOOD_CATEGORIES, PROVENANCE_TYPES } from '../models/Food.js';

const router = Router();

const foodValidators = (isCreate = false) => [
  body('name').if(() => isCreate).trim().notEmpty().withMessage('Nama makanan wajib diisi'),
  body('name').optional().trim().isLength({ max: 140 }).withMessage('Nama maksimal 140 karakter'),
  body('category').optional().isIn(FOOD_CATEGORIES).withMessage('Kategori tidak dikenal'),
  body('provenance.type').optional().isIn(PROVENANCE_TYPES).withMessage('Jenis provenance tidak dikenal'),
  body('originLocation')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('Lokasi asal tidak valid'),
  body('mainImage.url').optional().isString(),
  body('gallery').optional().isArray(),
];

router.get('/', optionalAuth, listFoods);

router.get('/id/:id', protect, param('id').isMongoId(), validate, getFoodById);

router.get('/:slug', optionalAuth, getFoodBySlug);

router.post('/', protect, foodValidators(true), validate, createFood);
router.put('/:id', protect, param('id').isMongoId(), foodValidators(false), validate, updateFood);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteFood);

export default router;
