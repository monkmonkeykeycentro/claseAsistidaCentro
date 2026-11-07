import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
  console.error('Configura MONGODB_URI y MONGODB_DB en .env.local. Consulta docs/mongodb-migration.md.');
  process.exit(1);
}
// Atlas uses the real Firebase Google sign-in; the Firebase emulators are not needed.
const environment = { ...process.env, VITE_DATA_BACKEND: 'mongodb' };
const children = [
  spawn(process.execPath, ['server/dev.mjs'], { env: environment, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port=3000', '--host=127.0.0.1', '--strictPort'], { env: environment, stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  children.forEach((child) => child.kill('SIGTERM'));
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
children.forEach((child) => {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 1));
});
