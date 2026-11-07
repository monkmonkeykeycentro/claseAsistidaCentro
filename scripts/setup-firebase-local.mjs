import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawnSync } from 'node:child_process';
import { findJava } from './local-java.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
if (findJava(root)) {
  console.log('Java 21 o posterior ya está disponible. Puedes ejecutar npm run dev:local.');
  process.exit(0);
}

const os = { darwin: 'mac', linux: 'linux' }[process.platform];
const architecture = { arm64: 'aarch64', x64: 'x64' }[process.arch];
if (!os || !architecture) {
  throw new Error('Instala Java 21 o posterior y configura JAVA_HOME antes de iniciar Firebase local.');
}

console.log('Descargando Java 21 (Eclipse Temurin) dentro de .firebase/java…');
const response = await fetch(`https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=${architecture}&image_type=jre&os=${os}&vendor=eclipse`);
if (!response.ok) throw new Error(`No se pudo consultar Java: HTTP ${response.status}`);
const releases = await response.json();
const archive = releases[0]?.binary?.package;
if (!archive?.link || !archive?.checksum) throw new Error('No se encontró una distribución compatible de Java.');

const destination = path.join(root, '.firebase/java');
if (existsSync(destination)) throw new Error('Ya existe .firebase/java pero no contiene Java 21. Revisa esa instalación.');
await mkdir(path.join(root, '.firebase'), { recursive: true });
const temporary = await mkdtemp(path.join(root, '.firebase/java-download-'));
try {
  const download = await fetch(archive.link);
  if (!download.ok || !download.body) throw new Error(`No se pudo descargar Java: HTTP ${download.status}`);
  const archivePath = path.join(temporary, 'java.tar.gz');
  await pipeline(Readable.fromWeb(download.body), createWriteStream(archivePath));
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(archivePath)) hash.update(chunk);
  if (hash.digest('hex') !== archive.checksum) throw new Error('La descarga de Java no coincide con su SHA-256.');
  const unpacked = path.join(temporary, 'runtime');
  await mkdir(unpacked);
  const extracted = spawnSync('tar', ['-xzf', archivePath, '-C', unpacked, '--strip-components=1'], { stdio: 'inherit' });
  if (extracted.status !== 0) throw new Error('No se pudo extraer Java. Comprueba que tar esté instalado.');
  await rename(unpacked, destination);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
if (!findJava(root)) throw new Error('Java se descargó pero no pudo ejecutarse. Revisa .firebase/java.');
console.log('Java listo. Ejecuta npm run dev:local para iniciar la aplicación y Firebase.');
