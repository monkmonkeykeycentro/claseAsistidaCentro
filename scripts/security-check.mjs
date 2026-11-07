import { readFile, readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';

const environment = { ...dotenv.parse(await readFile('.env.local', 'utf8').catch(() => '')), ...process.env };
const checks = [];
for (const key of ['MONGODB_URI', 'CMS_ADMIN_UIDS', 'GEMINI_API_KEY', 'GOOGLE_CLIENT_SECRET', 'FIREBASE_PRIVATE_KEY']) {
  const value = environment[key];
  if (value) for (const part of key === 'CMS_ADMIN_UIDS' ? value.split(',').map((id) => id.trim()).filter(Boolean) : [value]) checks.push([key, part]);
}
try {
  const password = decodeURIComponent(new URL(environment.MONGODB_URI).password);
  if (password.length >= 8) checks.push(['MongoDB password', password]);
} catch { /* The connection command validates the URI separately. */ }
if (environment.VITE_SECURITY_CANARY) checks.push(['unknown VITE variable canary', environment.VITE_SECURITY_CANARY]);
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\0').filter(Boolean);
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const rows = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) rows.push(...await walk(file));
    else if (entry.isFile()) rows.push(file);
  }
  return rows;
}
const built = await walk('dist');
if (!built.some((file) => file === 'dist/index.html')) throw new Error('Compila el sitio antes de ejecutar security:check.');
const findings = [];
for (const file of [...new Set([...files, ...built])]) {
  if (!await stat(file).catch(() => null)) continue; // Deleted files are not published.
  if (/(?:^|\/)(?:backups|exports|secrets|\.firebase|\.private)\//.test(file) || /(?:^|\/)\.env(?!\.example$)/.test(file)) {
    findings.push({ file, rule: 'private file in publishable source' });
    continue;
  }
  const content = await readFile(file);
  for (const [label, value] of checks) if (content.includes(Buffer.from(value))) findings.push({ file, rule: `private value: ${label}` });
  if (file.startsWith('dist/') && /\.map$/.test(file)) findings.push({ file, rule: 'public source map' });
}
if (findings.length) {
  console.error(JSON.stringify(findings, null, 2));
  process.exitCode = 1;
} else console.log(`Sin secretos configurados ni UID administrativos en ${files.length} archivos publicables y ${built.length} archivos compilados.`);
