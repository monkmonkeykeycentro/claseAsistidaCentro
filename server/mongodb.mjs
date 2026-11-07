import { fail } from './dataModel.mjs';

// Share one pool even if the server module is loaded more than once in the
// same process. Separate Vercel instances still have independent pools.
const key = Symbol.for('clase-asistida.mongodb');
const state = globalThis[key] ??= { connection: undefined };
export async function connectDatabase() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    fail('Configura MONGODB_URI y MONGODB_DB en el servidor.', 503, 'unavailable');
  }
  if (!state.connection) {
    // Cache before awaiting imports/connect, so concurrent requests share a pool.
    state.connection = (async () => {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, {
        maxPoolSize: 3,
        minPoolSize: 0,
        maxConnecting: 1,
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 5000,
        serverSelectionTimeoutMS: 10000,
        appName: 'clase-asistida-api',
      });
      try {
        if (process.env.VERCEL === '1') {
          const { attachDatabasePool } = await import('@vercel/functions/db-connections');
          attachDatabasePool(client);
        }
        await client.connect();
        return { client, db: client.db(process.env.MONGODB_DB) };
      } catch (error) {
        await client.close().catch(() => {});
        throw error;
      }
    })().catch((error) => {
      state.connection = undefined;
      throw error;
    });
  }
  return state.connection;
}
