import dotenv from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import { BSON } from 'mongodb';
import { connectDatabase } from '../server/mongodb.mjs';
import { parsePath, storedDocument, userCollections } from '../server/dataModel.mjs';
import { digest } from './migration-data.mjs';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const [sourceUid, targetUid, option] = process.argv.slice(2);
let client;
try {
  parsePath(`users/${sourceUid}`);
  parsePath(`users/${targetUid}`);
  if (!sourceUid || !targetUid || sourceUid === targetUid || (option && option !== '--apply') || process.argv.length > 5) throw new Error('Uso: npm run mongo:transfer-user -- UID_ORIGEN UID_DESTINO [--apply]. Sin --apply solo muestra el plan.');
  const connection = await connectDatabase();
  client = connection.client;
  const db = connection.db;
  const groups = [];
  for (const name of userCollections) {
    const collection = db.collection(`users_${name}`);
    const rows = await collection.find({ parentPath: `users/${sourceUid}/${name}` }).sort({ _id: 1 }).toArray();
    const copies = rows.map((row) => {
      if (row.data.userId && row.data.userId !== sourceUid) throw new Error('Hay un documento cuyo propietario no coincide con su ruta. Se canceló la copia.');
      return storedDocument(`users/${targetUid}/${name}/${row._id.split('/').at(-1)}`, { ...row.data, userId: targetUid });
    });
    if (copies.length) groups.push({ name: `users_${name}`, source: rows, copies });
  }
  const total = groups.reduce((count, group) => count + group.copies.length, 0);
  if (!total) throw new Error('El usuario de origen no tiene documentos personales.');
  const existing = [];
  async function checkDestination(group, session) {
    const found = await db.collection(group.name).find({ _id: { $in: group.copies.map((row) => row._id) } }, { session }).toArray();
    const current = new Map(found.map((row) => [row._id, row]));
    for (const copy of group.copies) {
      if (current.has(copy._id) && digest(current.get(copy._id)) !== digest(copy)) throw new Error('Hay documentos diferentes en la cuenta de destino. No se sobrescribirán.');
    }
    return found;
  }
  for (const group of groups) existing.push({ collection: group.name, documents: await checkDestination(group) });
  const summary = { mode: option ? 'applied' : 'dry-run', documents: total, collections: Object.fromEntries(groups.map((group) => [group.name, group.copies.length])), originalsRetained: true };
  if (option === '--apply') {
    await mkdir('backups', { recursive: true, mode: 0o700 });
    const file = `backups/user-transfer-before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`;
    await writeFile(file, BSON.EJSON.stringify({ sourceUid, targetUid, database: db.databaseName, source: groups.map((group) => ({ collection: group.name, documents: group.source })), destination: existing }, { relaxed: false }), { flag: 'wx', mode: 0o600 });
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        for (const group of groups) {
          const source = await db.collection(group.name).find({ parentPath: `users/${sourceUid}/${group.name.slice(6)}` }, { session }).sort({ _id: 1 }).toArray();
          if (digest(source) !== digest(group.source)) throw new Error('El origen cambió durante la copia. Repite la operación sin ediciones simultáneas.');
          await checkDestination(group, session);
          await db.collection(group.name).bulkWrite(group.copies.map((copy) => ({ replaceOne: { filter: { _id: copy._id }, replacement: copy, upsert: true } })), { session, ordered: true });
        }
      }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
    } finally { await session.endSession(); }
    for (const group of groups) {
      const actual = await checkDestination(group);
      if (actual.length !== group.copies.length) throw new Error('No se pudieron verificar todas las copias.');
    }
    console.log(`Respaldo previo: ${file}`);
  }
  console.log(JSON.stringify(summary, null, 2));
  // Profiles are created by the next real Google sign-in. This command does not
  // copy fictional email identities or grant membership in the admins directory.
} catch (error) {
  console.error(error?.name?.startsWith('Mongo') || error?.code === 'ENOTFOUND' ? 'No se pudo completar la copia en MongoDB; revisa la conexión con Atlas.' : error.message);
  process.exitCode = 1;
} finally { await client?.close(); }
