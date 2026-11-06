import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFirebaseRuntime } from '../src/config/firebaseRuntime.ts';

const enabled = process.env.FIRESTORE_EMULATOR_HOST === '127.0.0.1:8080'
  && process.env.FIREBASE_AUTH_EMULATOR_HOST === '127.0.0.1:9099';

test('a signed-in user can save, reopen and update a POO design in local Firestore', { skip: !enabled, timeout: 30000 }, async () => {
  mock.module('../src/config/firebaseRuntime.ts', { namedExports: {
    resolveFirebaseRuntime,
    firebaseRuntime: resolveFirebaseRuntime({ DEV: true, MODE: 'emulator' }),
  } });
  const { app, auth, db } = await import('../src/services/firebase.ts');
  assert.equal(app.options.projectId, 'demo-clase-asistida');
  const { saveClassDesignToFirestore, loadClassDesignsFromFirestore, deleteClassDesignFromFirestore, importClassDesignFromJson, exportClassDesignAsJson } = await import('../src/services/classDesignerService.ts');
  const { DEFAULT_EMPTY_PROJECT } = await import('../src/types/classDesigner.ts');
  const { GoogleAuthProvider, signInWithCredential, deleteUser } = await import('firebase/auth');
  const { terminate } = await import('firebase/firestore');
  const { deleteApp } = await import('firebase/app');
  const id = `test-poo-${crypto.randomUUID()}`;
  let user;
  try {
    user = (await signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({
      sub: id, email: `${id}@centro.edu.mx`, email_verified: true,
    })))).user;
    const imported = importClassDesignFromJson(exportClassDesignAsJson({ ...DEFAULT_EMPTY_PROJECT, id, projectName: 'Diseño local de prueba' }));
    assert.equal(imported.success, true);
    await saveClassDesignToFirestore(user.uid, imported.project);
    let projects = await loadClassDesignsFromFirestore(user.uid);
    assert.equal(projects.length, 1);
    assert.equal(projects[0].id, id);
    assert.equal(projects[0].userId, user.uid);
    assert.deepEqual(projects[0].fields, JSON.parse(JSON.stringify(imported.project.fields)));
    assert.deepEqual(projects[0].methods, imported.project.methods);
    await saveClassDesignToFirestore(user.uid, { ...projects[0], projectName: 'Diseño editado' });
    projects = await loadClassDesignsFromFirestore(user.uid);
    assert.equal(projects.length, 1);
    assert.equal(projects[0].projectName, 'Diseño editado');
    await assert.rejects(saveClassDesignToFirestore('another-user', imported.project), { code: 'permission-denied' });
  } finally {
    if (user) {
      await deleteClassDesignFromFirestore(user.uid, id);
      await deleteUser(user);
    }
    await terminate(db);
    await deleteApp(app);
  }
});
