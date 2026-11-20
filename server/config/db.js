/**
 * Database connection.
 *
 * Priority:
 *  1. MONGODB_URI from environment (MongoDB Atlas / local mongod).
 *  2. Development fallback: mongodb-memory-server, so the MVP can be
 *     explored without any external account. Data lives only while the
 *     server process runs; use `npm run seed` against a real URI to keep it.
 */
import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);

  const uri = (process.env.MONGODB_URI || '').trim();

  if (uri) {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'rasiboga_db',
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
    return { mode: 'external' };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI is required in production. Set it in the environment variables.'
    );
  }

  // Dynamic import keeps the 700MB dev binary out of production installs.
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName: 'rasiboga_db' },
  });
  await mongoose.connect(memoryServer.getUri(), { dbName: 'rasiboga_db' });
  console.log('[db] using in-memory MongoDB (development only, data is ephemeral)');
  return { mode: 'memory' };
}

export async function disconnectDB() {
  await mongoose.connection.close().catch(() => {});
  if (memoryServer) {
    await memoryServer.stop().catch(() => {});
    memoryServer = null;
  }
}

export function dbMode() {
  return memoryServer ? 'memory' : 'external';
}
