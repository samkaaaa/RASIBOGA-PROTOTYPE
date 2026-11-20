import Article from '../models/Article.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination, toBoolean, uniqueSlug } from '../utils/helpers.js';

export const listArticles = asyncHandler(async (req, res) => {
  const includeDrafts = Boolean(req.admin) && toBoolean(req.query.includeDrafts, false);
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (!includeDrafts) filter.published = true;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ title: rx }, { excerpt: rx }];
  }

  const [items, total] = await Promise.all([
    Article.find(filter).select('-content').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Article.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const getArticleBySlug = asyncHandler(async (req, res) => {
  const filter = { slug: String(req.params.slug).toLowerCase() };
  if (!req.admin) filter.published = true;

  const article = await Article.findOne(filter);
  if (!article) throw new ApiError(404, 'Artikel tidak ditemukan atau belum dipublikasikan.');
  res.json({ success: true, data: article });
});

export const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw new ApiError(404, 'Artikel tidak ditemukan.');
  res.json({ success: true, data: article });
});

export const createArticle = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = await uniqueSlug(Article, payload.slug || payload.title);
  const article = await Article.create(payload);
  res.status(201).json({ success: true, data: article, message: 'Artikel berhasil dibuat.' });
});

export const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw new ApiError(404, 'Artikel tidak ditemukan.');

  const payload = { ...req.body };
  delete payload._id;

  if (payload.title && payload.title !== article.title && !payload.slug) {
    payload.slug = await uniqueSlug(Article, payload.title, article._id);
  } else if (payload.slug && payload.slug !== article.slug) {
    payload.slug = await uniqueSlug(Article, payload.slug, article._id);
  } else {
    delete payload.slug;
  }

  Object.assign(article, payload);
  await article.save();
  res.json({ success: true, data: article, message: 'Artikel berhasil diperbarui.' });
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw new ApiError(404, 'Artikel tidak ditemukan.');
  await article.deleteOne();
  res.json({ success: true, message: 'Artikel berhasil dihapus.' });
});
