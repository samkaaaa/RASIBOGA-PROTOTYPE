import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import Location from '../models/Location.js';
import Video from '../models/Video.js';
import Article from '../models/Article.js';
import CommunitySubmission from '../models/CommunitySubmission.js';
import { PROVENANCE_LABELS } from '../models/Food.js';
import {
  articlesSeed,
  foodsSeed,
  ingredientsSeed,
  locationsSeed,
  videosSeed,
} from '../data/seedData.js';

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@rasiboga.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'GantiSayaSegera123!';
  const name = process.env.ADMIN_NAME || 'Administrator RASIBOGA';

  let admin = await Admin.findOne({ email });
  if (admin) return { admin, created: false };

  admin = await Admin.create({ name, email, password, role: 'admin' });
  return { admin, created: true };
}

/**
 * Seeds the database. Idempotent unless `reset` is true.
 * @param {{reset?: boolean, quiet?: boolean}} options
 */
export async function seedDatabase({ reset = false, quiet = false } = {}) {
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  const { admin, created } = await ensureAdmin();
  if (created) log(`[seed] administrator dibuat: ${admin.email}`);

  if (reset) {
    log('[seed] menghapus konten lama...');
    await Promise.all([
      Food.deleteMany({}),
      Recipe.deleteMany({}),
      Ingredient.deleteMany({}),
      Location.deleteMany({}),
      Video.deleteMany({}),
      Article.deleteMany({}),
      CommunitySubmission.deleteMany({}),
    ]);
  }

  const existing = await Food.countDocuments();
  if (existing > 0) {
    log(`[seed] konten sudah ada (${existing} makanan), seeding dilewati.`);
    return { skipped: true, adminCreated: created };
  }

  // --- Locations -----------------------------------------------------------
  const locationMap = new Map();
  for (const location of locationsSeed) {
    const { key, ...data } = location;
    const doc = await Location.create(data);
    locationMap.set(key, doc._id);
  }
  log(`[seed] ${locationMap.size} lokasi dibuat`);

  // --- Ingredients ---------------------------------------------------------
  const ingredientMap = new Map();
  for (const ingredient of ingredientsSeed) {
    const { key, originKeys = [], ...data } = ingredient;
    const doc = await Ingredient.create({
      ...data,
      slug: key,
      image: { url: `/assets/ingredients/${key}.svg`, publicId: '' },
      originLocations: originKeys.map((originKey) => locationMap.get(originKey)).filter(Boolean),
      verificationStatus: 'unverified',
    });
    ingredientMap.set(key, doc._id);
  }
  log(`[seed] ${ingredientMap.size} bahan dibuat`);

  // --- Foods + recipes -----------------------------------------------------
  let recipeCount = 0;
  for (const foodSeed of foodsSeed) {
    const { recipe, originKey, ...foodData } = foodSeed;
    const image = `/assets/foods/${foodSeed.slug}.svg`;

    const food = await Food.create({
      ...foodData,
      provenance: {
        type: foodSeed.provenance.type,
        label: PROVENANCE_LABELS[foodSeed.provenance.type],
      },
      originLocation: locationMap.get(originKey) || null,
      mainImage: { url: image, publicId: '' },
      gallery: [],
      contentStatus: 'draft',
      published: true,
    });

    if (!recipe) continue;

    const ingredients = recipe.ingredients.map((item) => ({
      ingredient: ingredientMap.get(item.key) || null,
      name: item.key,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || '',
    }));

    const steps = recipe.steps.map((step, index) => ({
      stepNumber: index + 1,
      title: step.title || '',
      description: step.description,
      media:
        index === 0
          ? { type: 'illustration', url: image, thumbnail: image }
          : { type: '', url: '', thumbnail: '' },
      durationSeconds: step.durationSeconds || 0,
      tips: step.tips || '',
    }));

    await Recipe.create({
      title: `Resep ${food.name}`,
      food: food._id,
      servings: recipe.servings,
      preparationTime: recipe.preparationTime,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      ingredients,
      equipment: recipe.equipment,
      steps,
      tutorialVideo: { provider: '', url: '', embedUrl: '' },
      notes: recipe.notes,
      contentStatus: 'draft',
      published: true,
    });
    recipeCount += 1;
  }
  log(`[seed] ${foodsSeed.length} makanan dan ${recipeCount} resep dibuat`);

  // --- Articles ------------------------------------------------------------
  for (const article of articlesSeed) {
    await Article.create({ ...article, published: true, author: 'Tim RASIBOGA' });
  }
  log(`[seed] ${articlesSeed.length} artikel dibuat`);

  // --- Videos (drafts on purpose: no official media yet) -------------------
  for (const video of videosSeed) {
    await Video.create({ ...video, published: false });
  }
  log(`[seed] ${videosSeed.length} slot video contoh dibuat (status draf)`);

  return {
    skipped: false,
    adminCreated: created,
    counts: {
      foods: foodsSeed.length,
      recipes: recipeCount,
      ingredients: ingredientMap.size,
      locations: locationMap.size,
      articles: articlesSeed.length,
      videos: videosSeed.length,
    },
  };
}

/** True when the database has no content yet. */
export async function isDatabaseEmpty() {
  const [foods, articles] = await Promise.all([Food.estimatedDocumentCount(), Article.estimatedDocumentCount()]);
  return foods === 0 && articles === 0;
}

export async function dropDatabase() {
  await mongoose.connection.dropDatabase();
}
