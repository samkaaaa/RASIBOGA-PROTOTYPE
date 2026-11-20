import Food, { FOOD_CATEGORIES, PROVENANCE_LABELS } from '../models/Food.js';
import Location from '../models/Location.js';
import Recipe from '../models/Recipe.js';
import Video from '../models/Video.js';
import Ingredient from '../models/Ingredient.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, toBoolean, uniqueSlug } from '../utils/helpers.js';
import { deleteMedia, deleteMediaList } from '../services/media.js';

const LOCATION_FIELDS = 'name village district regency province coordinates locationType verificationStatus';

const foodPopulate = { path: 'originLocation', select: LOCATION_FIELDS };

function buildFoodFilter(query, { includeDrafts = false } = {}) {
  const filter = {};
  if (!includeDrafts) filter.published = true;

  if (query.search) {
    filter.name = { $regex: escapeRegex(query.search), $options: 'i' };
  }
  if (query.category) filter.category = query.category;
  if (query.provenance) filter['provenance.type'] = query.provenance;
  if (query.featured !== undefined && query.featured !== '') {
    filter.featured = toBoolean(query.featured);
  }
  if (query.district) {
    // District lives on the referenced location, so resolve ids first.
    filter.originLocation = { $in: query.__districtIds || [] };
  }
  if (query.location) filter.originLocation = query.location;
  return filter;
}

function buildSort(sort) {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'name':
      return { name: 1 };
    case 'featured':
      return { featured: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

export const listFoods = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin) && toBoolean(req.query.includeDrafts, false);
  const { page, limit, skip } = parsePagination(req.query);

  const query = { ...req.query };
  if (query.district) {
    const locations = await Location.find({
      district: { $regex: `^${escapeRegex(query.district)}$`, $options: 'i' },
    }).select('_id');
    query.__districtIds = locations.map((item) => item._id);
  }

  const filter = buildFoodFilter(query, { includeDrafts });

  const [items, total] = await Promise.all([
    Food.find(filter).populate(foodPopulate).sort(buildSort(req.query.sort)).skip(skip).limit(limit),
    Food.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
    },
  });
});

export const getFoodBySlug = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin);
  const filter = { slug: String(req.params.slug).toLowerCase() };
  if (!includeDrafts) filter.published = true;

  const food = await Food.findOne(filter).populate(foodPopulate);
  if (!food) throw new ApiError(404, 'Makanan tidak ditemukan atau belum dipublikasikan.');

  const recipeFilter = { food: food._id };
  if (!includeDrafts) recipeFilter.published = true;

  const [recipes, videos, related] = await Promise.all([
    Recipe.find(recipeFilter).populate('ingredients.ingredient', 'name slug image verificationStatus').sort({ createdAt: 1 }),
    Video.find({ relatedFood: food._id, ...(includeDrafts ? {} : { published: true }) }).sort({ featured: -1, createdAt: -1 }),
    Food.find({
      _id: { $ne: food._id },
      category: food.category,
      ...(includeDrafts ? {} : { published: true }),
    })
      .populate(foodPopulate)
      .sort({ featured: -1, createdAt: -1 })
      .limit(4),
  ]);

  const ingredientIds = new Set();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((item) => {
      if (item.ingredient?._id) ingredientIds.add(String(item.ingredient._id));
    });
  });

  const ingredients = ingredientIds.size
    ? await Ingredient.find({ _id: { $in: [...ingredientIds] } }).populate('originLocations', LOCATION_FIELDS)
    : [];

  res.json({
    success: true,
    data: {
      food,
      recipe: recipes[0] || null,
      recipes,
      videos,
      ingredients,
      related,
    },
  });
});

/** GET /foods/id/:id — admin convenience for edit forms. */
export const getFoodById = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id).populate(foodPopulate);
  if (!food) throw new ApiError(404, 'Makanan tidak ditemukan.');
  res.json({ success: true, data: food });
});

function normaliseProvenance(input) {
  if (!input) return undefined;
  const type = input.type;
  if (!type) return undefined;
  return { type, label: PROVENANCE_LABELS[type] };
}

export const createFood = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = await uniqueSlug(Food, payload.slug || payload.name);
  payload.provenance = normaliseProvenance(payload.provenance) || {
    type: 'general',
    label: PROVENANCE_LABELS.general,
  };
  if (!payload.category) payload.category = FOOD_CATEGORIES[0];

  const food = await Food.create(payload);
  await food.populate(foodPopulate);
  res.status(201).json({ success: true, data: food, message: 'Makanan berhasil dibuat.' });
});

export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw new ApiError(404, 'Makanan tidak ditemukan.');

  const payload = { ...req.body };
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;

  if (payload.name && payload.name !== food.name && !payload.slug) {
    payload.slug = await uniqueSlug(Food, payload.name, food._id);
  } else if (payload.slug && payload.slug !== food.slug) {
    payload.slug = await uniqueSlug(Food, payload.slug, food._id);
  } else {
    delete payload.slug;
  }

  const provenance = normaliseProvenance(payload.provenance);
  if (provenance) payload.provenance = provenance;
  else delete payload.provenance;

  const previousMain = food.mainImage?.publicId;
  const previousGallery = (food.gallery || []).map((item) => item.publicId);

  Object.assign(food, payload);
  await food.save();

  // Clean up media that was replaced in this update.
  if (previousMain && previousMain !== food.mainImage?.publicId) {
    await deleteMedia({ publicId: previousMain, url: food.mainImage?.url });
  }
  const currentGallery = new Set((food.gallery || []).map((item) => item.publicId));
  const removed = previousGallery.filter((id) => id && !currentGallery.has(id));
  if (removed.length) await deleteMediaList(removed.map((publicId) => ({ publicId })));

  await food.populate(foodPopulate);
  res.json({ success: true, data: food, message: 'Makanan berhasil diperbarui.' });
});

export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw new ApiError(404, 'Makanan tidak ditemukan.');

  const recipeCount = await Recipe.countDocuments({ food: food._id });
  if (recipeCount > 0 && !toBoolean(req.query.cascade, false)) {
    throw new ApiError(
      409,
      `Makanan ini masih memiliki ${recipeCount} resep. Kirim ?cascade=true untuk menghapus beserta resepnya.`
    );
  }

  if (recipeCount > 0) {
    await Recipe.deleteMany({ food: food._id });
  }
  await Video.updateMany({ relatedFood: food._id }, { $set: { relatedFood: null } });

  await deleteMedia(food.mainImage);
  await deleteMediaList(food.gallery);
  await food.deleteOne();

  res.json({ success: true, message: 'Makanan berhasil dihapus.' });
});

export const listCategories = asyncHandler(async (_req, res) => {
  const counts = await Food.aggregate([
    { $match: { published: true } },
    { $group: { _id: '$category', total: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((item) => [item._id, item.total]));

  res.json({
    success: true,
    data: FOOD_CATEGORIES.map((name) => ({ name, total: map.get(name) || 0 })),
  });
});
