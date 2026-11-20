import CommunitySubmission from '../models/CommunitySubmission.js';
import { ApiError, asyncHandler, escapeRegex, parsePagination } from '../utils/helpers.js';
import { persistUpload } from '../middleware/upload.js';

export const createSubmission = asyncHandler(async (req, res) => {
  const { type, name, email, title, description } = req.body;

  const media = [];
  const files = Array.isArray(req.files) ? req.files : [];
  for (const file of files.slice(0, 3)) {
    // Only images are accepted from the public form.
    const uploaded = await persistUpload(file, { kind: 'image', folder: 'community' });
    media.push(uploaded);
  }

  const submission = await CommunitySubmission.create({
    type,
    name,
    email,
    title,
    description,
    media,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Terima kasih! Kontribusi Anda masuk ke antrean peninjauan editor.',
    data: { id: submission._id, status: submission.status },
  });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ title: rx }, { name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    CommunitySubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CommunitySubmission.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total },
  });
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Status tidak valid.');
  }

  const submission = await CommunitySubmission.findById(req.params.id);
  if (!submission) throw new ApiError(404, 'Kontribusi tidak ditemukan.');

  submission.status = status;
  if (adminNote !== undefined) submission.adminNote = adminNote;
  submission.reviewedAt = status === 'pending' ? null : new Date();
  await submission.save();

  res.json({ success: true, data: submission, message: 'Status kontribusi diperbarui.' });
});
