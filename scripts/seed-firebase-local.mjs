import { fileURLToPath } from 'node:url';
import path from 'node:path';
import config from '../firebase.local.json' with { type: 'json' };

// These URLs and the demo project are fixed: this script never seeds a cloud database.
const projectId = 'demo-clase-asistida';
const authUrl = `http://${config.emulators.auth.host}:${config.emulators.auth.port}`;
const firestoreUrl = `http://${config.emulators.firestore.host}:${config.emulators.firestore.port}`;
const adminUid = 'local-admin';
const email = 'jmartineza@centro.edu.mx';
const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' };

export async function seedLocalAdmin() {
  const lookup = await fetch(`${authUrl}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, {
    method: 'POST', headers, body: JSON.stringify({ localId: [adminUid] }),
  });
  const account = await lookup.json();
  if (!lookup.ok) throw new Error(`No se pudo consultar Auth local: ${account.error?.message ?? lookup.status}`);
  if (!account.users?.length) {
    const created = await fetch(`${authUrl}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchCreate`, {
      method: 'POST', headers,
      body: JSON.stringify({ users: [{
        localId: adminUid, email, emailVerified: true, displayName: 'Administrador local',
        providerUserInfo: [{ providerId: 'google.com', rawId: adminUid, email, displayName: 'Administrador local' }],
      }] }),
    });
    const result = await created.json();
    if (!created.ok || result.error?.length) throw new Error(`No se pudo crear el administrador local: ${JSON.stringify(result.error ?? result)}`);
  }
  const documentUrl = `${firestoreUrl}/v1/projects/${projectId}/databases/(default)/documents/admins/${adminUid}`;
  const existing = await fetch(documentUrl, { headers });
  if (existing.status === 404) {
    const created = await fetch(`${documentUrl}?currentDocument.exists=false`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ fields: {
        uid: { stringValue: adminUid }, email: { stringValue: email },
        assignedAt: { stringValue: new Date().toISOString() },
      } }),
    });
    if (!created.ok) throw new Error(`No se pudo crear admins/${adminUid}: HTTP ${created.status}`);
  } else if (!existing.ok) {
    throw new Error(`No se pudo consultar Firestore local: HTTP ${existing.status}`);
  }
  console.log(`Administrador local listo: ${email}. Selecciónalo en la ventana de acceso simulada.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await seedLocalAdmin();
}
