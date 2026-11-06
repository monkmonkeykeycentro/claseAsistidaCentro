import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidates = [process.env.JAVA_HOME, path.join(root, '.firebase/java/Contents/Home'), path.join(root, '.firebase/java'),
  '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home'].filter(Boolean);
function hasJava21(command) {
  const result = spawnSync(command, ['-version'], { encoding: 'utf8' });
  return result.status === 0 && Number(`${result.stderr}${result.stdout}`.match(/version "(\d+)/)?.[1]) >= 21;
}
const javaHome = candidates.find((home) => existsSync(path.join(home, 'bin/java')) && hasJava21(path.join(home, 'bin/java')));
if (!javaHome && !hasJava21('java')) {
  console.error('Firebase local necesita Java 21 o posterior. Instálalo y configura JAVA_HOME.');
  process.exit(1);
}
const startOnly = process.argv[2] === 'start';
const directory = path.join(root, '.firebase/local-data');
const args = [startOnly ? 'emulators:start' : 'emulators:exec', '--project', 'demo-clase-asistida',
  '--config', 'firebase.local.json', '--only', 'auth,firestore', '--non-interactive', '--export-on-exit', directory];
if (existsSync(path.join(directory, 'firebase-export-metadata.json'))) args.push('--import', directory);
if (!startOnly) args.push('--ui', 'npm run dev:app');
const environment = { ...process.env, DEBUG: '', CI: 'true', NO_UPDATE_NOTIFIER: '1',
  XDG_CONFIG_HOME: path.join(root, '.firebase/config'), FIREBASE_DEBUG_PATH: path.join(root, '.firebase/firebase-debug.log'),
  FIREBASE_EMULATORS_PATH: path.join(root, '.firebase/cache') };
if (javaHome) {
  environment.JAVA_HOME = javaHome;
  environment.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH ?? ''}`;
}
console.log('Firebase local · demo-clase-asistida · Panel: http://127.0.0.1:4000');
const child = spawn(process.execPath, [path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'), ...args],
  { cwd: root, env: environment, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 0; });
