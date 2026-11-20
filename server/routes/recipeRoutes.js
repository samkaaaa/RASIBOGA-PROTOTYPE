import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createRecipe,
  deleteRecipe,
  getRecipeByFood,
  getRecipeById,
  listRecipes,
  updateRecipe,
} from '../controllers/recipeController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DIFFICULTIES } from '../models/Recipe.js';

const router = Router();

const recipeValidators = (isCreate = false) => [
  body('food').if(() => isCreate).isMongoId().withMessage('Makanan wajib dipilih'),
  body('food').optional().isMongoId().withMessage('Makanan tidak valid'),
  body('servings').optional().isInt({ min: 1, max: 100 }).withMessage('Porsi harus 1-100'),
  body('preparationTime').optional().isInt({ min: 0 }).withMessage('Waktu persiapan tidak valid'),
  body('cookingTime').optional().isInt({ min: 0 }).withMessage('Waktu memasak tidak valid'),
  body('difficulty').optional().isIn(DIFFICULTIES).withMessage('Tingkat kesulitan tidak dikenal'),
  body('steps').optional().isArray().withMessage('Langkah harus berupa daftar'),
  body('steps.*.description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Instruksi langkah tidak boleh kosong'),
  body('steps.*.durationSeconds').optional().isInt({ min: 0 }).withMessage('Durasi langkah tidak valid'),
  body('steps.*.media.type')
    .optional({ values: 'falsy' })
    .isIn(['video', 'animation', 'illustration'])
    .withMessage('Tipe media langkah tidak dikenal'),
  body('ingredients').optional().isArray(),
  body('equipment').optional().isArray(),
];

router.get('/', optionalAuth, listRecipes);
router.get('/food/:foodId', optionalAuth, param('foodId').isMongoId(), validate, getRecipeByFood);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, getRecipeById);

router.post('/', protect, recipeValidators(true), validate, createRecipe);
router.put('/:id', protect, param('id').isMongoId(), recipeValidators(false), validate, updateRecipe);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteRecipe);

export default router;
