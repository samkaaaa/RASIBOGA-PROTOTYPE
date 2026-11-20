import { Router } from 'express';
import mongoose from 'mongoose';
import foodRoutes from './foodRoutes.js';
import recipeRoutes from './recipeRoutes.js';
import ingredientRoutes from './ingredientRoutes.js';
import locationRoutes from './locationRoutes.js';
import videoRoutes from './videoRoutes.js';
import articleRoutes from './articleRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js';
import communityRoutes from './communityRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';
import { dbMode } from '../config/db.js';
import { isCloudinaryEnabled } from '../config/cloudinary.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? dbMode() : 'disconnected',
      media: isCloudinaryEnabled ? 'cloudinary' : 'local-disk',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/foods', foodRoutes);
router.use('/recipes', recipeRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/locations', locationRoutes);
router.use('/videos', videoRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/community', communityRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
