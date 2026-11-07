import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFirebaseRuntime } from '../src/config/firebaseRuntime.ts';

const enabled = !!process.env.FIRESTORE_EMULATOR_HOST && !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

test('local Firebase: initialize CMS, read history, migrate content, and enforce permissions', { skip: !enabled, timeout: 90000 }, async () => {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8080');
  assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, '127.0.0.1:9099');
  assert.equal(process.env.GCLOUD_PROJECT, 'demo-clase-asistida');
  // Only the Vite environment is replaced; Auth, Firestore and rules are real emulators.
  mock.module('../src/config/firebaseRuntime.ts', { namedExports: {
    firebaseRuntime: resolveFirebaseRuntime({ DEV: true, MODE: 'emulator' }),
    resolveFirebaseRuntime,
  } });
  const identity = await import('../src/services/firebase.ts');
  const cms = await import('../src/services/cmsService.ts');
  const { GoogleAuthProvider, signInWithCredential, signOut } = await import('firebase/auth');
  const { collection, getDocs, doc, setDoc, terminate } = await import('firebase/firestore');
  const { deleteApp } = await import('firebase/app');
  const { seedLocalAdmin } = await import('../scripts/seed-firebase-local.mjs');
  const login = (email, uid) => signInWithCredential(identity.auth, GoogleAuthProvider.credential(JSON.stringify({
    sub: uid, email, email_verified: true, name: 'Prueba local',
  })));
  try {
    await seedLocalAdmin();
    await seedLocalAdmin();
    await login('jmartineza@centro.edu.mx', 'local-admin');
    assert.equal(identity.auth.currentUser.uid, 'local-admin');
    assert.equal((await identity.requireCmsAdmin()).role, 'admin');
    await cms.seedCmsFromExistingContentIfEmpty();
    assert.ok((await cms.getCmsModules(true)).length > 0);
    // Regression for the original permission-denied on a collection-wide history query.
    assert.deepEqual(await cms.getCmsRevisions(), []);
    const category = { id: 'cat_local', name: 'Local', slug: 'local', position: 0, visible: true, createdAt: '', updatedAt: '' };
    await cms.saveCmsCategory(category);
    const backup = await cms.exportCurriculumBackup();
    assert.equal(backup.version, '1.1.0');
    assert.ok(backup.categories.some((item) => item.id === category.id));
    await cms.importCurriculumBackup(backup);
    assert.ok((await cms.getCmsRevisions()).length >= 2);
    await signOut(identity.auth);
    await login('student@centro.edu.mx', 'local-student');
    await assert.rejects(getDocs(collection(identity.db, 'cms_revisions')), { code: 'permission-denied' });
    await assert.rejects(setDoc(doc(identity.db, 'cms_modules', 'forbidden'), { title: 'No autorizado' }), { code: 'permission-denied' });
    const user = identity.auth.currentUser;
    await setDoc(doc(identity.db, 'users', user.uid, 'progress', 'local-test'), { userId: user.uid });
  } finally {
    await signOut(identity.auth);
    await terminate(identity.db);
    await deleteApp(identity.app);
  }
});
