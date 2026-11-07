import { mkdir, writeFile } from 'node:fs/promises';
import config from '../firebase.local.json' with { type: 'json' };

// This command intentionally has no production mode or arbitrary URL argument.
const emulator = `127.0.0.1:${config.emulators.firestore.port}`;
const projectId = 'demo-clase-asistida';
const documents = [];
const root = `projects/${projectId}/databases/(default)/documents`;
try {
  await fetch(`http://${emulator}/`, { signal: AbortSignal.timeout(2000) });
  async function request(path, body) {
    const response = await fetch(`http://${emulator}/v1/${path}`, {
      ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`El emulador respondió ${response.status}.`);
    return response.json();
  }
  async function visit(parent) {
    let collectionToken;
    do {
      const page = await request(`${parent}:listCollectionIds`, { pageSize: 100, ...(collectionToken ? { pageToken: collectionToken } : {}) });
      for (const name of page.collectionIds || []) {
        let documentToken;
        do {
          // showMissing also visits absent parents with existing subcollections.
          const query = new URLSearchParams({ pageSize: '100', showMissing: 'true', ...(documentToken ? { pageToken: documentToken } : {}) });
          const listed = await request(`${parent}/${name}?${query}`);
          for (const raw of listed.documents || []) {
            if (raw.createTime || raw.updateTime || raw.fields) documents.push({ path: raw.name.slice(root.length + 1), fields: raw.fields || {}, sourceUpdateTime: raw.updateTime });
            await visit(raw.name);
          }
          documentToken = listed.nextPageToken;
        } while (documentToken);
      }
      collectionToken = page.nextPageToken;
    } while (collectionToken);
  }
  await visit(root);
  documents.sort((a, b) => a.path.localeCompare(b.path));
  await mkdir('backups', { recursive: true, mode: 0o700 });
  const file = `backups/firebase-local-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await writeFile(file, JSON.stringify({ format: 'firestore-local-snapshot/1', sourceRoot: root.replace(/\/documents$/, ''), exportedAt: new Date().toISOString(), documents }, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(`Exportados ${documents.length} documentos, incluidas subcolecciones: ${file}`);
} catch (error) {
  console.error('No se pudo exportar Firebase local. Inicia npm run firebase:local y pausa la edición de contenido durante la exportación.');
  process.exitCode = 1;
}
