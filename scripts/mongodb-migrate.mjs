import dotenv from 'dotenv';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { BSON } from 'mongodb';
import { connectDatabase } from '../server/mongodb.mjs';
import { cmsCollections, parsePath, userCollections } from '../server/dataModel.mjs';
import { digest, parseSnapshot, summarize } from './migration-data.mjs';
const { EJSON } = BSON;

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const [command, file, ...options] = process.argv.slice(2);
let client;
try {
  if (!['plan', 'check', 'import', 'verify'].includes(command) || (command !== 'check' && !file) || options.some((option) => option !== '--overwrite') || (options.length && command !== 'import')) {
    throw new Error('Uso: npm run mongo:plan -- archivo.json | mongo:check | mongo:import -- archivo.json [--overwrite] | mongo:verify -- archivo.json');
  }
  const documents = command === 'check' ? [] : parseSnapshot(JSON.parse(await readFile(file, 'utf8')));
  if (command === 'plan') {
    console.log(JSON.stringify({ mode: 'dry-run', ...summarize(documents) }, null, 2));
  } else {
    const connection = await connectDatabase();
    client = connection.client;
    const db = connection.db;
    await db.command({ ping: 1 });
    if (command === 'check') console.log('Conexión con MongoDB correcta.');
    else {
      if (!documents.length) throw new Error('El origen está vacío. No se importará nada.');
      const groups = new Map();
      for (const document of documents) {
        const name = parsePath(document._id).collection;
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push(document);
      }
      async function readGroup(name, rows, session) {
        return new Map((await db.collection(name).find({ _id: { $in: rows.map((row) => row._id) } }, { session }).toArray()).map((row) => [row._id, row]));
      }
      const conflicts = [];
      for (const [name, rows] of groups) {
        const current = await readGroup(name, rows);
        for (const document of rows) if (current.has(document._id) && digest(current.get(document._id)) !== digest(document)) conflicts.push(document._id);
      }
      if (command === 'import') {
        if (conflicts.length && !options.includes('--overwrite')) throw new Error(`Hay ${conflicts.length} documentos diferentes en el destino. Se canceló sin escribir. Usa una base vacía o revisa antes de ejecutar --overwrite.`);
        // Back up every supported collection before the first write, including
        // records absent in the source. The migration never deletes extra records.
        const backup = [];
        const names = [...cmsCollections, 'admins', 'users', ...userCollections.map((name) => `users_${name}`)];
        for (const name of names) {
          const rows = await db.collection(name).find({}).toArray();
          if (rows.length) backup.push({ collection: name, documents: rows });
        }
        await mkdir('backups', { recursive: true, mode: 0o700 });
        const backupFile = `backups/mongodb-before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`;
        await writeFile(backupFile, EJSON.stringify({ database: db.databaseName, exportedAt: new Date(), collections: backup }, { relaxed: false }), { flag: 'wx', mode: 0o600 });
        console.log(`Respaldo del destino: ${backupFile}`);
        // Prepare collections/indexes outside transactions for Atlas compatibility.
        for (const name of Object.keys(summarize(documents).collections)) {
          await db.collection(name).createIndex({ parentPath: 1, _id: 1 });
        }
        const session = client.startSession();
        try {
          await session.withTransaction(async () => {
            for (const [name, rows] of groups) {
              const current = await readGroup(name, rows, session);
              const writes = [];
              for (const document of rows) {
                const existing = current.get(document._id);
                if (existing && digest(existing) !== digest(document) && !options.includes('--overwrite')) throw new Error('El destino cambió durante la importación. No se guardó el lote.');
                if (!existing || digest(existing) !== digest(document)) writes.push({ replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true } });
              }
              if (writes.length) await db.collection(name).bulkWrite(writes, { session, ordered: true });
            }
          }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' } });
        } finally { await session.endSession(); }
      }
      let verified = 0;
      for (const [name, rows] of groups) {
        const current = await readGroup(name, rows);
        for (const document of rows) {
          const actual = current.get(document._id);
          if (!actual || digest(actual) !== digest(document)) throw new Error(`La verificación falló: ${document._id}`);
          verified++;
        }
      }
      console.log(JSON.stringify({ verified, ...summarize(documents) }, null, 2));
    }
  }
} catch (error) {
  // Never print driver errors or connection strings, which can contain credentials.
  const safe = error?.name?.startsWith('Mongo') || error?.name?.includes('DNS') || error?.code === 'ENOTFOUND';
  console.error(safe ? 'No se pudo conectar o completar la operación en MongoDB. Revisa credenciales, IP permitida y disponibilidad de Atlas.' : error.message);
  process.exitCode = 1;
} finally { await client?.close(); }
