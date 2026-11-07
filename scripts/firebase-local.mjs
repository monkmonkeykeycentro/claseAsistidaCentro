import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findJava } from './local-java.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2] ?? 'dev';
if (!['dev', 'start', 'test'].includes(mode)) throw new Error(`Modo local desconocido: ${mode}`);
const java = findJava(root);
if (!java) {
  console.error('Firebase local necesita Java 21. Ejecuta primero npm run firebase:setup.');
  process.exit(1);
}

const dataDirectory = path.join(root, '.firebase/local-data');
const args = [
  mode === 'start' ? 'emulators:start' : 'emulators:exec',
  '--project', 'demo-clase-asistida',
  '--config', 'firebase.local.json',
  '--only', 'auth,firestore',
  '--non-interactive',
];
if (mode !== 'test') {
  args.push('--export-on-exit', dataDirectory);
  if (existsSync(path.join(dataDirectory, 'firebase-export-metadata.json'))) args.push('--import', dataDirectory);
}
if (mode === 'dev') {
  args.push('--ui', 'npm run dev:app');
} else if (mode === 'test') {
  args.push('node --experimental-test-module-mocks --import tsx --test tests/firebase.emulator.test.mjs');
}

const environment = {
  ...process.env,
  VITE_DATA_BACKEND: 'firestore',
  CI: 'true',
  NO_UPDATE_NOTIFIER: '1',
  DEBUG: process.env.FIREBASE_LOCAL_DEBUG === '1' ? 'true' : '',
  FIREBASE_DEBUG_PATH: path.join(root, '.firebase/firebase-debug.log'),
  XDG_CONFIG_HOME: path.join(root, '.firebase/config'),
  FIREBASE_EMULATORS_PATH: path.join(root, '.firebase/cache'),
};
if (java.home) {
  environment.JAVA_HOME = java.home;
  environment.PATH = `${path.join(java.home, 'bin')}${path.delimiter}${process.env.PATH ?? ''}`;
}

console.log('Firebase local: demo-clase-asistida · Firestore (default) · Auth 9099 · Firestore 8080');
if (mode !== 'test') console.log('Panel local: http://127.0.0.1:4000 · Datos: .firebase/local-data');
const child = spawn(process.execPath, [path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), ...args], {
  cwd: root,
  env: environment,
  stdio: 'inherit',
});
// Allow the CLI to export data and stop its child processes on Ctrl+C.
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
