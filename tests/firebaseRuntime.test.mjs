import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFirebaseRuntime } from '../src/config/firebaseRuntime.ts';

test('local development uses a demo project and redirects Auth and Firestore together', () => {
  const runtime = resolveFirebaseRuntime({ DEV: true, MODE: 'emulator' });
  assert.equal(runtime.config.projectId, 'demo-clase-asistida');
  assert.equal(runtime.config.firestoreDatabaseId, '(default)');
  assert.equal(runtime.authEmulatorUrl, 'http://127.0.0.1:9099');
  assert.deepEqual(runtime.firestoreEmulator, { host: '127.0.0.1', port: 8080 });
});

test('production builds always use production Firebase, including emulator build mode', () => {
  const runtime = resolveFirebaseRuntime({ DEV: false, MODE: 'emulator' });
  assert.equal(runtime.useEmulators, false);
  assert.equal(runtime.config.projectId, 'rugged-precept-406017');
});
