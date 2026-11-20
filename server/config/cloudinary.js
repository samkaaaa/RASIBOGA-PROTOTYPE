import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

export const isCloudinaryEnabled = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {{folder?: string, resourceType?: 'image'|'video'|'auto', publicId?: string}} options
 */
export function uploadBuffer(buffer, { folder = 'rasiboga', resourceType = 'auto', publicId } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: publicId, overwrite: false },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      }
    );
    stream.end(buffer);
  });
}

/** Best-effort delete. Never let a media cleanup failure break a request. */
export async function destroyAsset(publicId, resourceType = 'image') {
  if (!isCloudinaryEnabled || !publicId) return false;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.warn('[cloudinary] destroy failed:', error.message);
    return false;
  }
}
