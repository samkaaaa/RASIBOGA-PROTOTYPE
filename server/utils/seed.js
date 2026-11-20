/**
 * CLI seeder.
 *   npm run seed          -> seed if empty (keeps existing content)
 *   npm run seed:reset    -> wipe content collections and reseed
 *
 * Works with MONGODB_URI, or with the in-memory fallback in development.
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../services/seedService.js';

const reset = process.argv.includes('--reset');

try {
  await connectDB();
  const result = await seedDatabase({ reset });
  if (result.skipped) {
    console.log('[seed] tidak ada perubahan. Gunakan `npm run seed:reset` untuk menimpa konten.');
  } else {
    console.log('[seed] selesai:', result.counts);
  }
} catch (error) {
  console.error('[seed] gagal:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
