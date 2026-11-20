import Recipe from '../models/Recipe.js';
import Food from '../models/Food.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, toBoolean } from '../utils/helpers.js';
import { buildYouTubeEmbed } from '../utils/youtube.js';

const FOOD_FIELDS = 'name slug category provenance mainImage published';
const INGREDIENT_FIELDS = 'name slug image verificationStatus';

function populateRecipe(query) {
  return query
    .populate({ path: 'food', select: FOOD_FIELDS })
    .populate({ path: 'ingredients.ingredient', select: INGREDIENT_FIELDS });
}

/** Normalise the tutorial video so admins can submit plain YouTube URLs. */
function normaliseTutorialVideo(input) {
  if (!input) return { provider: '', url: '', embedUrl: '' };
  const url = (input.url || '').trim();
  if (!url) return { provider: '', url: '', embedUrl: '' };

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const parsed = buildYouTubeEmbed(url);
    if (!parsed) throw new ApiError(400, 'URL YouTube tidak valid.');
    return { provider: 'youtube', url: parsed.url, embedUrl: parsed.embedUrl };
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new ApiError(400, 'URL video harus diawali http:// atau https://');
  }
  return { provider: input.provider || 'cloudinary', url, embedUrl: '' };
}

export const listRecipes = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin) && toBoolean(req.query.includeDrafts, false);
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (!includeDrafts) filter.published = true;
  if (req.query.food) filter.food = req.query.food;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    const foods = await Food.find({ name: rx }).select('_id');
    filter.$or = [{ title: rx }, { food: { $in: foods.map((item) => item._id) } }];
  }

  const [items, total] = await Promise.all([
    populateRecipe(Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Recipe.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await populateRecipe(Recipe.findById(req.params.id));
  if (!recipe) throw new ApiError(404, 'Resep tidak ditemukan.');
  if (!recipe.published && !req.admin) throw new ApiError(404, 'Resep belum dipublikasikan.');
  res.json({ success: true, data: recipe });
});

export const getRecipeByFood = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin);
  const filter = { food: req.params.foodId };
  if (!includeDrafts) filter.published = true;

  const recipes = await populateRecipe(Recipe.find(filter).sort({ createdAt: 1 }));
  if (!recipes.length) throw new ApiError(404, 'Belum ada resep untuk makanan ini.');

  res.json({ success: true, data: recipes[0], recipes });
});

export const createRecipe = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  const food = await Food.findById(payload.food);
  if (!food) throw new ApiError(400, 'Makanan yang dirujuk tidak ditemukan.');

  if (payload.tutorialVideo) payload.tutorialVideo = normaliseTutorialVideo(payload.tutorialVideo);
  if (!payload.title) payload.title = `Resep ${food.name}`;

  const recipe = await Recipe.create(payload);
  await recipe.populate([{ path: 'food', select: FOOD_FIELDS }]);
  res.status(201).json({ success: true, data: recipe, message: 'Resep berhasil dibuat.' });
});

export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new ApiError(404, 'Resep tidak ditemukan.');

  const payload = { ...req.body };
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;

  if (payload.food && String(payload.food) !== String(recipe.food)) {
    const food = await Food.findById(payload.food);
    if (!food) throw new ApiError(400, 'Makanan yang dirujuk tidak ditemukan.');
  }
  if (payload.tutorialVideo) payload.tutorialVideo = normaliseTutorialVideo(payload.tutorialVideo);

  Object.assign(recipe, payload);
  await recipe.save();
  await recipe.populate([{ path: 'food', select: FOOD_FIELDS }]);

  res.json({ success: true, data: recipe, message: 'Resep berhasil diperbarui.' });
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new ApiError(404, 'Resep tidak ditemukan.');
  await recipe.deleteOne();
  res.json({ success: true, message: 'Resep berhasil dihapus.' });
});
