import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import Location from '../models/Location.js';
import Video from '../models/Video.js';
import Article from '../models/Article.js';
import CommunitySubmission from '../models/CommunitySubmission.js';
import { asyncHandler } from '../utils/helpers.js';
import { isCloudinaryEnabled } from '../config/cloudinary.js';
import { dbMode } from '../config/db.js';

export const getStats = asyncHandler(async (_req, res) => {
  const [
    foods,
    publishedFoods,
    recipes,
    publishedRecipes,
    ingredients,
    locations,
    videos,
    articles,
    pending,
    recentFoods,
    recentSubmissions,
  ] = await Promise.all([
    Food.countDocuments(),
    Food.countDocuments({ published: true }),
    Recipe.countDocuments(),
    Recipe.countDocuments({ published: true }),
    Ingredient.countDocuments(),
    Location.countDocuments(),
    Video.countDocuments(),
    Article.countDocuments(),
    CommunitySubmission.countDocuments({ status: 'pending' }),
    Food.find().select('name slug category published featured mainImage updatedAt').sort({ updatedAt: -1 }).limit(5),
    CommunitySubmission.find()
      .select('type name title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    data: {
      totals: {
        foods,
        publishedFoods,
        recipes,
        publishedRecipes,
        ingredients,
        locations,
        videos,
        articles,
        pendingSubmissions: pending,
      },
      recentFoods,
      recentSubmissions,
    },
  });
});

export const getSettings = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      site: {
        name: 'RASIBOGA',
        tagline: 'Digital Culinary Heritage Platform of Rembang',
        regency: 'Kabupaten Rembang',
        province: 'Jawa Tengah',
        version: '3.0.0-mvp',
      },
      runtime: {
        nodeEnv: process.env.NODE_ENV || 'development',
        database: dbMode(),
        media: isCloudinaryEnabled ? 'cloudinary' : 'local-disk',
        cloudinaryConfigured: isCloudinaryEnabled,
        mongodbConfigured: Boolean(process.env.MONGODB_URI),
      },
      admin: {
        name: _req.admin?.name,
        email: _req.admin?.email,
        role: _req.admin?.role,
        lastLoginAt: _req.admin?.lastLoginAt,
      },
    },
  });
});
