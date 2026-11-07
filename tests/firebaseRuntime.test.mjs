import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFirebaseRuntime } from '../src/config/firebaseRuntime.ts';

test('MongoDB development uses real Firebase Auth even if the previous dev server used emulator mode', () => {
  const runtime = resolveFirebaseRuntime({ DEV: true, MODE: 'emulator', VITE_DATA_BACKEND: 'mongodb' });
  assert.equal(runtime.useEmulators, false);
  assert.notEqual(runtime.config.projectId, 'demo-clase-asistida');
});

test('local development uses a demo project and redirects Auth and Firestore together', () => {
  const runtime = resolveFirebaseRuntime({ DEV: true, MODE: 'emulator' });
  assert.equal(runtime.config.projectId, 'demo-clase-asistida');
  assert.equal(runtime.config.firestoreDatabaseId, '(default)');
  assert.equal(runtime.authEmulatorUrl, 'http://127.0.0.1:9099');
  assert.deepEqual(runtime.firestoreEmulator, { host: '127.0.0.1', port: 8080 });
});

test('production builds always use production Firebase, including emulator build mode', () => {
  const runtime = resolveFirebaseRuntime({ DEV: false, MODE: 'emulator', VITE_FIREBASE_PROJECT_ID: 'test-project', VITE_FIREBASE_API_KEY: 'public-test-key' });
  assert.equal(runtime.useEmulators, false);
  assert.equal(runtime.config.projectId, 'test-project');
});
