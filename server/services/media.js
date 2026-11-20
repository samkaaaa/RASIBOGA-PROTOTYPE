import { destroyAsset } from '../config/cloudinary.js';
import { removeLocalUpload } from '../middleware/upload.js';

/**
 * Best-effort media cleanup. A failure here must never fail the API call
 * that triggered it (the database record is already gone).
 */
export async function deleteMedia(media) {
  if (!media) return;
  const publicId = typeof media === 'string' ? media : media.publicId;
  const url = typeof media === 'string' ? media : media.url;
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    await removeLocalUpload(publicId);
    return;
  }
  if (url && /\.(mp4|webm|mov|ogv)(\?|$)/i.test(url)) {
    await destroyAsset(publicId, 'video');
    return;
  }
  await destroyAsset(publicId, 'image');
}

export async function deleteMediaList(list = []) {
  await Promise.allSettled((list || []).filter(Boolean).map((item) => deleteMedia(item)));
}
