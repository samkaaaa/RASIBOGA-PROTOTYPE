import Admin from '../models/Admin.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';
import { AUTH_COOKIE, cookieOptions, signToken } from '../middleware/auth.js';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map(); // ip -> { count, firstAt }

function tooManyAttempts(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function registerFailure(ip) {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  if (tooManyAttempts(ip)) {
    throw new ApiError(429, 'Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.');
  }

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!admin) {
    registerFailure(ip);
    throw new ApiError(401, 'Email atau kata sandi salah.');
  }

  const match = await admin.comparePassword(password);
  if (!match) {
    registerFailure(ip);
    throw new ApiError(401, 'Email atau kata sandi salah.');
  }

  attempts.delete(ip);
  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken(admin);
  res.cookie(AUTH_COOKIE, token, cookieOptions());

  res.json({
    success: true,
    message: 'Berhasil masuk.',
    data: { admin: admin.toJSON(), token },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'Berhasil keluar.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.admin });
});
