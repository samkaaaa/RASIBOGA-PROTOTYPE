import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticleBySlug,
  listArticles,
  updateArticle,
} from '../controllers/articleController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const articleValidators = (isCreate = false) => [
  body('title').if(() => isCreate).trim().notEmpty().withMessage('Judul artikel wajib diisi'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Ringkasan maksimal 500 karakter'),
  body('category').optional().trim().isLength({ max: 80 }),
];

router.get('/', optionalAuth, listArticles);
router.get('/id/:id', protect, param('id').isMongoId(), validate, getArticleById);
router.get('/:slug', optionalAuth, getArticleBySlug);

router.post('/', protect, articleValidators(true), validate, createArticle);
router.put('/:id', protect, param('id').isMongoId(), articleValidators(false), validate, updateArticle);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteArticle);

export default router;
