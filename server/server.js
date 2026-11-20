import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

import { connectDB, disconnectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { UPLOAD_ROOT } from './middleware/upload.js';
import { seedDatabase, isDatabaseEmpty } from './services/seedService.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const isProd = process.env.NODE_ENV === 'production';

/* ------------------------------------------------------------------ */
/* Configuration guards                                                */
/* ------------------------------------------------------------------ */
if (!process.env.JWT_SECRET) {
  if (isProd) {
    console.error('[fatal] JWT_SECRET wajib diisi di production.');
    process.exit(1);
  }
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('[warn] JWT_SECRET tidak ditemukan. Menggunakan secret sementara untuk development.');
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // the API only returns JSON; the SPA sets its own policy
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // curl / same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProd && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(new Error('Origin tidak diizinkan oleh CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
  })
);

// Locally stored uploads (used when Cloudinary is not configured).
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', fallthrough: true }));

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.use('/api', apiRoutes);

/* ------------------------------------------------------------------ */
/* Production: serve the built SPA from ../client/dist                 */
/* ------------------------------------------------------------------ */
const clientDist = path.resolve(process.cwd(), '..', 'client', 'dist');
if (isProd && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
async function start() {
  try {
    await connectDB();

    if (!isProd) {
      if (await isDatabaseEmpty()) {
        console.log('[seed] database kosong — menjalankan seed awal...');
        await seedDatabase();
      } else {
        // Still make sure a bootstrap admin exists.
        await seedDatabase({ quiet: true });
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`[api] RASIBOGA berjalan di http://localhost:${PORT}/api`);
      console.log(`[api] health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[api] ${signal} diterima, menutup server...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[fatal] gagal menjalankan server:', error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') start();

export default app;
