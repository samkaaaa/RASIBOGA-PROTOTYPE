import Location from '../models/Location.js';
import Food from '../models/Food.js';
import Ingredient from '../models/Ingredient.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, toBoolean } from '../utils/helpers.js';

const FIELDS = 'name village district regency province coordinates locationType verificationStatus description';

export const listLocations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination({ ...req.query, limit: req.query.limit || 60 });
  const filter = {};

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { village: rx }, { district: rx }];
  }
  if (req.query.district) filter.district = { $regex: `^${escapeRegex(req.query.district)}$`, $options: 'i' };
  if (req.query.type) filter.locationType = req.query.type;
  if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
  if (req.query.hasCoordinates === 'true') {
    filter['coordinates.lat'] = { $ne: null };
    filter['coordinates.lng'] = { $ne: null };
  }

  const [items, total] = await Promise.all([
    Location.find(filter).sort({ district: 1, name: 1 }).skip(skip).limit(limit),
    Location.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, 'Lokasi tidak ditemukan.');
  res.json({ success: true, data: location });
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json({ success: true, data: location, message: 'Lokasi berhasil dibuat.' });
});

export const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, 'Lokasi tidak ditemukan.');

  const payload = { ...req.body };
  delete payload._id;
  Object.assign(location, payload);
  await location.save();

  res.json({ success: true, data: location, message: 'Lokasi berhasil diperbarui.' });
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, 'Lokasi tidak ditemukan.');

  const [foods, ingredients] = await Promise.all([
    Food.countDocuments({ originLocation: location._id }),
    Ingredient.countDocuments({ originLocations: location._id }),
  ]);

  if ((foods || ingredients) && !toBoolean(req.query.cascade, false)) {
    throw new ApiError(
      409,
      `Lokasi masih dipakai oleh ${foods} makanan dan ${ingredients} bahan. Kirim ?cascade=true untuk melepas keterkaitannya.`
    );
  }

  await Food.updateMany({ originLocation: location._id }, { $set: { originLocation: null } });
  await Ingredient.updateMany({ originLocations: location._id }, { $pull: { originLocations: location._id } });
  await location.deleteOne();

  res.json({ success: true, message: 'Lokasi berhasil dihapus.' });
});

/**
 * GET /locations/map
 * Returns two independent marker collections plus the district list.
 * Only locations with real, finite coordinates are included.
 */
export const getMapData = asyncHandler(async (req, res) => {
  const district = req.query.district;

  const foodFilter = { published: true };
  const ingredientFilter = {};

  const [foods, ingredients, districts] = await Promise.all([
    Food.find(foodFilter)
      .populate('originLocation', FIELDS)
      .select('name slug category provenance mainImage originLocation')
      .sort({ featured: -1, name: 1 }),
    Ingredient.find(ingredientFilter)
      .populate('originLocations', FIELDS)
      .select('name slug image verificationStatus originLocations')
      .sort({ name: 1 }),
    Location.distinct('district', { district: { $nin: ['', null] } }),
  ]);

  const matchesDistrict = (location) =>
    !district || String(location?.district || '').toLowerCase() === String(district).toLowerCase();

  const foodMarkers = foods
    .filter((food) => food.originLocation && food.originLocation.hasCoordinates && matchesDistrict(food.originLocation))
    .map((food) => ({
      id: String(food._id),
      name: food.name,
      slug: food.slug,
      category: food.category,
      provenance: food.provenance,
      image: food.mainImage?.url || '',
      location: food.originLocation,
    }));

  const ingredientMarkers = [];
  ingredients.forEach((ingredient) => {
    (ingredient.originLocations || [])
      .filter((location) => location?.hasCoordinates && matchesDistrict(location))
      .forEach((location) => {
        ingredientMarkers.push({
          id: `${ingredient._id}-${location._id}`,
          ingredientId: String(ingredient._id),
          name: ingredient.name,
          slug: ingredient.slug,
          image: ingredient.image?.url || '',
          verificationStatus: ingredient.verificationStatus,
          location,
        });
      });
  });

  res.json({
    success: true,
    data: {
      foodMarkers,
      ingredientMarkers,
      districts: districts.sort((a, b) => a.localeCompare(b)),
      center: { lat: -6.71, lng: 111.35 },
      boundsHint:
        'Titik pada peta adalah contoh data awal. Verifikasi koordinat sebelum dipublikasikan.',
    },
  });
});
