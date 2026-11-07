import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import production from '../firebase-applet-config.json' with { type: 'json' };
import local from '../firebase.local.json' with { type: 'json' };
import { collectCmsDocuments, createFirestoreReader, importToLocal, makeCmsBackup, summarizeDocuments } from './lib/firestore-transfer.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const localProjectId = 'demo-clase-asistida';
const localOrigin = `http://${local.emulators.firestore.host}:${local.emulators.firestore.port}`;
const localDatabase = `projects/${localProjectId}/databases/(default)`;
const productionDatabase = `projects/${production.projectId}/databases/${production.firestoreDatabaseId}`;
const mode = process.argv[2];
if (!['pull', 'export'].includes(mode)) throw new Error('Usa npm run firebase:pull o npm run firebase:export:local.');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

async function nativeLocalBackup(directory) {
  await mkdir(path.dirname(directory), { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'),
      'emulators:export', directory, '--project', localProjectId, '--config', 'firebase.local.json',
      '--only', 'auth,firestore', '--force', '--non-interactive',
    ], {
      cwd: root, stdio: 'inherit',
      env: { ...process.env, DEBUG: '', CI: 'true', NO_UPDATE_NOTIFIER: '1',
        XDG_CONFIG_HOME: path.join(root, '.firebase/config'), FIREBASE_DEBUG_PATH: path.join(root, '.firebase/firebase-debug.log') },
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error('No se pudo guardar la copia nativa del emulador.')));
  });
}

async function saveSnapshots(documents, sourceRoot, account, label) {
  const directory = path.join(root, '.firebase/snapshots');
  await mkdir(directory, { recursive: true });
  const exportedAt = new Date().toISOString();
  const rawPath = path.join(directory, `${label}-${stamp}.firestore.json`);
  const cmsPath = path.join(directory, `${label}-${stamp}.cms.json`);
  const snapshot = { format: 'firestore-cms-snapshot/1', sourceRoot, exportedAt, documents };
  await writeFile(rawPath, JSON.stringify(snapshot, null, 2), { mode: 0o600 });
  await writeFile(cmsPath, JSON.stringify(makeCmsBackup(documents, exportedAt, account), null, 2), { mode: 0o600 });
  console.log(`Copia con tipos originales: ${rawPath}`);
  console.log(`Respaldo para importar desde el CMS: ${cmsPath}`);
  console.table(summarizeDocuments(documents));
}

try {
  // A local health check happens before authentication or reading production.
  const localReader = createFirestoreReader({ origin: localOrigin, databaseRoot: localDatabase, authorization: 'Bearer owner' });
  await localReader.listCollections();
  if (mode === 'export') {
    const documents = await collectCmsDocuments(localReader);
    await saveSnapshots(documents, localDatabase, 'Administrador local', 'local');
    await nativeLocalBackup(path.join(root, '.firebase/local-data'));
  } else {
    // Reuse the CLI session without printing credentials or persisting extra copies.
    const auth = require('firebase-tools/lib/auth');
    const account = auth.getProjectDefaultAccount(root);
    if (!account?.tokens?.refresh_token) throw new Error('Primero inicia sesión en tu terminal con npx firebase login.');
    const credentials = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
    const reader = createFirestoreReader({ origin: 'https://firestore.googleapis.com', databaseRoot: productionDatabase,
      authorization: `Bearer ${credentials.access_token}` });
    console.log(`Leyendo contenido CMS de ${production.projectId}/${production.firestoreDatabaseId}…`);
    const documents = await collectCmsDocuments(reader);
    if (!documents.length) throw new Error('Producción no devolvió documentos CMS. No se importó nada.');
    await saveSnapshots(documents, productionDatabase, account.user.email, 'production');
    const beforePath = path.join(root, '.firebase/backups', `before-pull-${stamp}`);
    await nativeLocalBackup(beforePath);
    await importToLocal({ origin: localOrigin, projectId: localProjectId, documents, sourceRoot: productionDatabase });
    await nativeLocalBackup(path.join(root, '.firebase/local-data'));
    console.log(`Importación comprobada: ${documents.length} documentos CMS copiados a ${localProjectId}.`);
    console.log(`Respaldo local anterior: ${beforePath}`);
  }
} catch (error) {
  console.error(error instanceof TypeError && error.message === 'fetch failed'
    ? 'No se pudo conectar. Comprueba la conexión y que npm run dev:local siga ejecutándose.'
    : error.message);
  process.exitCode = 1;
}
