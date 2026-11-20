import { ApiError } from '../utils/helpers.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Never leaks stack traces or credentials to clients.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Terjadi kesalahan pada server.';
  let details = error.details;

  // Mongoose: validation
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Data yang dikirim belum valid.';
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // Mongoose: bad ObjectId
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Nilai tidak valid untuk kolom "${error.path}".`;
  }

  // MongoDB: duplicate key
  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || error.keyPattern || {})[0] || 'data';
    message = `Nilai untuk "${field}" sudah digunakan.`;
    details = error.keyValue;
  }

  // Multer
  if (error.name === 'MulterError') {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') message = 'Ukuran berkas melebihi batas yang diizinkan.';
    else message = `Berkas tidak dapat diproses (${error.code}).`;
  }

  if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Ukuran permintaan terlalu besar.';
  }

  if (statusCode >= 500) {
    console.error('[error]', error);
    message = 'Terjadi kesalahan pada server.';
    details = undefined;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
