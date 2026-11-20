import Ingredient from '../models/Ingredient.js';
import Location from '../models/Location.js';
import Recipe from '../models/Recipe.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, slugify, uniqueSlug } from '../utils/helpers.js';
import { deleteMedia } from '../services/media.js';

const LOCATION_FIELDS = 'name village district regency coordinates verificationStatus locationType';

export const listIngredients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
  if (req.query.location) filter.originLocations = req.query.location;
  if (req.query.district) {
    const locations = await Location.find({
      district: { $regex: `^${escapeRegex(req.query.district)}$`, $options: 'i' },
    }).select('_id');
    filter.originLocations = { $in: locations.map((item) => item._id) };
  }

  const [items, total] = await Promise.all([
    Ingredient.find(filter)
      .populate('originLocations', LOCATION_FIELDS)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Ingredient.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const getIngredientById = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id).populate('originLocations', LOCATION_FIELDS);
  if (!ingredient) throw new ApiError(404, 'Bahan tidak ditemukan.');
  res.json({ success: true, data: ingredient });
});

export const createIngredient = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = await uniqueSlug(Ingredient, payload.slug || payload.name);
  const ingredient = await Ingredient.create(payload);
  await ingredient.populate('originLocations', LOCATION_FIELDS);
  res.status(201).json({ success: true, data: ingredient, message: 'Bahan berhasil dibuat.' });
});

export const updateIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) throw new ApiError(404, 'Bahan tidak ditemukan.');

  const payload = { ...req.body };
  delete payload._id;
  if (payload.name && payload.name !== ingredient.name && !payload.slug) {
    payload.slug = await uniqueSlug(Ingredient, payload.name, ingredient._id);
  } else {
    delete payload.slug;
  }

  const previousImage = ingredient.image?.publicId;
  Object.assign(ingredient, payload);
  await ingredient.save();

  if (previousImage && previousImage !== ingredient.image?.publicId) {
    await deleteMedia({ publicId: previousImage, url: ingredient.image?.url });
  }

  await ingredient.populate('originLocations', LOCATION_FIELDS);
  res.json({ success: true, data: ingredient, message: 'Bahan berhasil diperbarui.' });
});

export const deleteIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) throw new ApiError(404, 'Bahan tidak ditemukan.');

  // Referential integrity: detach from recipes instead of leaving dangling ids.
  await Recipe.updateMany(
    { 'ingredients.ingredient': ingredient._id },
    { $pull: { ingredients: { ingredient: ingredient._id } } }
  );

  await deleteMedia(ingredient.image);
  await ingredient.deleteOne();
  res.json({ success: true, message: 'Bahan berhasil dihapus.' });
});

/** GET /ingredients/slug/:slug — used by glossary / ingredient pages. */
export const getIngredientBySlug = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findOne({ slug: req.params.slug }).populate(
    'originLocations',
    LOCATION_FIELDS
  );
  if (!ingredient) throw new ApiError(404, 'Bahan tidak ditemukan.');
  res.json({ success: true, data: ingredient });
});

