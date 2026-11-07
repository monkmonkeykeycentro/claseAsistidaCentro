import { fail } from './dataModel.mjs';

let connection;
export async function connectDatabase() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    fail('Configura MONGODB_URI y MONGODB_DB en el servidor.', 503, 'unavailable');
  }
  if (!connection) {
    // Cache before awaiting imports/connect, so concurrent requests share a pool.
    connection = (async () => {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
      try {
        await client.connect();
        return { client, db: client.db(process.env.MONGODB_DB) };
      } catch (error) {
        await client.close().catch(() => {});
        throw error;
      }
    })().catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}
