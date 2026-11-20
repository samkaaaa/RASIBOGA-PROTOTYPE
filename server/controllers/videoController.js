import Video from '../models/Video.js';
import Food from '../models/Food.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, toBoolean } from '../utils/helpers.js';
import { buildYouTubeEmbed } from '../utils/youtube.js';

const FOOD_FIELDS = 'name slug mainImage category';

function normaliseVideo(body) {
  const payload = { ...body };
  const url = (payload.url || '').trim();

  if (payload.type === 'youtube') {
    const parsed = buildYouTubeEmbed(url);
    if (!parsed) throw new ApiError(400, 'URL YouTube tidak valid atau bukan tautan YouTube.');
    payload.url = parsed.url;
    payload.embedUrl = parsed.embedUrl;
    if (!payload.thumbnail) payload.thumbnail = parsed.thumbnail;
  } else if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/uploads/')) {
    throw new ApiError(400, 'URL video harus diawali http:// atau https://');
  }

  return payload;
}

export const listVideos = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin) && toBoolean(req.query.includeDrafts, false);
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (!includeDrafts) filter.published = true;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.featured !== undefined && req.query.featured !== '') filter.featured = toBoolean(req.query.featured);
  if (req.query.relatedFood) filter.relatedFood = req.query.relatedFood;
  if (req.query.search) filter.title = { $regex: escapeRegex(req.query.search), $options: 'i' };

  const [items, total] = await Promise.all([
    Video.find(filter).populate('relatedFood', FOOD_FIELDS).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Video.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('relatedFood', FOOD_FIELDS);
  if (!video) throw new ApiError(404, 'Video tidak ditemukan.');
  if (!video.published && !req.admin) throw new ApiError(404, 'Video belum dipublikasikan.');
  res.json({ success: true, data: video });
});

export const createVideo = asyncHandler(async (req, res) => {
  const payload = normaliseVideo(req.body);
  if (payload.relatedFood) {
    const exists = await Food.exists({ _id: payload.relatedFood });
    if (!exists) throw new ApiError(400, 'Makanan yang dirujuk tidak ditemukan.');
  }
  const video = await Video.create(payload);
  await video.populate('relatedFood', FOOD_FIELDS);
  res.status(201).json({ success: true, data: video, message: 'Video berhasil dibuat.' });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video tidak ditemukan.');

  const payload = normaliseVideo({ ...req.body, type: req.body.type ?? video.type });
  delete payload._id;
  Object.assign(video, payload);
  await video.save();
  await video.populate('relatedFood', FOOD_FIELDS);

  res.json({ success: true, data: video, message: 'Video berhasil diperbarui.' });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw new ApiError(404, 'Video tidak ditemukan.');
  await video.deleteOne();
  res.json({ success: true, message: 'Video berhasil dihapus.' });
});
