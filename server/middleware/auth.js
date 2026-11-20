import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';

export const AUTH_COOKIE = 'rasiboga_token';
/** Non-sensitive hint so the SPA can skip /auth/me when nobody is logged in. */
export const AUTH_HINT_COOKIE = 'rasiboga_auth';

export function signToken(admin) {
  return jwt.sign(
    { sub: String(admin._id), role: admin.role, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

/**
 * Accepts the JWT from the httpOnly cookie (preferred) or an
 * `Authorization: Bearer` header (useful for API tooling).
 */
export const protect = asyncHandler(async (req, _res, next) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'Server belum dikonfigurasi: JWT_SECRET kosong.');
  }

  let token = req.cookies?.[AUTH_COOKIE];
  const header = req.headers.authorization;
  if (!token && header?.startsWith('Bearer ')) token = header.slice(7);

  if (!token) throw new ApiError(401, 'Silakan masuk terlebih dahulu.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Sesi tidak valid atau sudah kedaluwarsa.');
  }

  const admin = await Admin.findById(payload.sub).select('-password');
  if (!admin) throw new ApiError(401, 'Akun administrator tidak ditemukan.');

  req.admin = admin;
  return next();
});

/**
 * Attaches `req.admin` when a valid token exists, but never blocks the request.
 * Used by public list endpoints so admins can request drafts.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  try {
    let token = req.cookies?.[AUTH_COOKIE];
    const header = req.headers.authorization;
    if (!token && header?.startsWith('Bearer ')) token = header.slice(7);
    if (!token || !process.env.JWT_SECRET) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub).select('-password');
    if (admin) req.admin = admin;
  } catch {
    // ignore invalid tokens on public endpoints
  }
  return next();
});

/** Only `admin` role may mutate destructive resources (currently same as protect). */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return next(new ApiError(403, 'Anda tidak memiliki izin untuk tindakan ini.'));
  }
  return next();
};
