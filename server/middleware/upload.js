import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { isCloudinaryEnabled, uploadBuffer } from '../config/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 8);
const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_MB || 50);

export const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

export const VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']);

const EXTENSION_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/ogg': '.ogv',
};

export const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

/** In-memory storage with a hard size cap; validated again per kind below. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(MAX_IMAGE_MB, MAX_VIDEO_MB) * 1024 * 1024,
    files: 5,
  },
});

function assertKind(file, kind) {
  if (!file) throw new ApiError(400, 'Tidak ada berkas yang diunggah.');
  const allowed = kind === 'video' ? VIDEO_MIME : IMAGE_MIME;
  const maxMb = kind === 'video' ? MAX_VIDEO_MB : MAX_IMAGE_MB;

  if (!allowed.has(file.mimetype)) {
    throw new ApiError(
      400,
      kind === 'video'
        ? 'Format video tidak didukung. Gunakan MP4, WebM, MOV, atau OGG.'
        : 'Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, AVIF, atau GIF.'
    );
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new ApiError(400, `Ukuran berkas melebihi ${maxMb}MB.`);
  }
}

async function saveLocally(file, folder, kind) {
  const now = new Date();
  const subDir = path.join(folder, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'));
  const targetDir = path.join(UPLOAD_ROOT, subDir);
  await fs.mkdir(targetDir, { recursive: true });

  const ext = EXTENSION_BY_MIME[file.mimetype] || path.extname(file.originalname || '').toLowerCase() || '';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.writeFile(path.join(targetDir, filename), file.buffer);

  const publicPath = `/uploads/${subDir.split(path.sep).join('/')}/${filename}`;
  return {
    url: publicPath,
    publicId: `local:${publicPath}`,
    resourceType: kind,
  };
}

/**
 * Persists one uploaded buffer. Uses Cloudinary when configured,
 * otherwise the local `server/uploads` folder.
 */
export async function persistUpload(file, { kind = 'image', folder = 'rasiboga' } = {}) {
  assertKind(file, kind);

  if (isCloudinaryEnabled) {
    const result = await uploadBuffer(file.buffer, {
      folder: `rasiboga/${folder}`,
      resourceType: kind === 'video' ? 'video' : 'image',
    });
    return { url: result.url, publicId: result.publicId, resourceType: kind };
  }

  return saveLocally(file, folder, kind);
}

/** DELETE /api/uploads — removes a locally stored file (Cloudinary handled in service). */
export async function removeLocalUpload(publicId) {
  if (!publicId?.startsWith('local:/uploads/')) return false;
  const relative = publicId.replace('local:', '').replace('/uploads/', '');
  const target = path.join(UPLOAD_ROOT, relative);
  if (!target.startsWith(UPLOAD_ROOT)) return false; // path traversal guard
  try {
    await fs.unlink(target);
    return true;
  } catch {
    return false;
  }
}

export const uploadSingle = (field = 'file') => upload.single(field);
export const uploadMany = (field = 'media', max = 4) => upload.array(field, max);

/** Controller helper: POST /api/uploads */
export const handleUpload = asyncHandler(async (req, res) => {
  const requestedKind = req.body?.kind === 'video' ? 'video' : 'image';
  const media = await persistUpload(req.file, {
    kind: requestedKind,
    folder: req.body?.folder || 'uploads',
  });

  res.status(201).json({ success: true, data: media });
});
