import { MongoClient } from 'mongodb';

let connection;
export async function connectDatabase() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    throw Object.assign(new Error('Configura MONGODB_URI y MONGODB_DB en el servidor.'), { status: 503, code: 'unavailable' });
  }
  if (!connection) {
    const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
    connection = client.connect().then(() => ({ client, db: client.db(process.env.MONGODB_DB) })).catch(async (error) => {
      connection = undefined;
      await client.close().catch(() => {});
      throw error;
    });
  }
  return connection;
}
