import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function findJava(root) {
  const homes = [
    process.env.JAVA_HOME,
    path.join(root, '.firebase/java/Contents/Home'),
    path.join(root, '.firebase/java'),
    '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
    '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
  ].filter(Boolean);
  const candidates = homes.map((home) => ({ home, bin: path.join(home, 'bin/java') }));
  candidates.push({ bin: 'java' });
  for (const candidate of candidates) {
    if (candidate.home && !existsSync(candidate.bin)) continue;
    const result = spawnSync(candidate.bin, ['-version'], { encoding: 'utf8' });
    const major = Number(`${result.stderr}${result.stdout}`.match(/version "(\d+)/)?.[1]);
    if (result.status === 0 && major >= 21) return candidate;
  }
  return null;
}
