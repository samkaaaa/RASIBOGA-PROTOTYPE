import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createIngredient,
  deleteIngredient,
  getIngredientById,
  getIngredientBySlug,
  listIngredients,
  updateIngredient,
} from '../controllers/ingredientController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const ingredientValidators = (isCreate = false) => [
  body('name').if(() => isCreate).trim().notEmpty().withMessage('Nama bahan wajib diisi'),
  body('name').optional().trim().isLength({ max: 140 }),
  body('originLocations').optional().isArray(),
  body('originLocations.*').optional().isMongoId().withMessage('Lokasi asal tidak valid'),
  body('verificationStatus')
    .optional()
    .isIn(['verified', 'unverified'])
    .withMessage('Status verifikasi tidak dikenal'),
];

router.get('/', listIngredients);
router.get('/slug/:slug', getIngredientBySlug);
router.get('/:id', param('id').isMongoId(), validate, getIngredientById);

router.post('/', protect, ingredientValidators(true), validate, createIngredient);
router.put('/:id', protect, param('id').isMongoId(), ingredientValidators(false), validate, updateIngredient);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteIngredient);

export default router;
