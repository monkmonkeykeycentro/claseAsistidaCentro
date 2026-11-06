import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { optimizeDeps, resolveConfig } from 'vite';

test('reloading the optimized editor reuses the GapCursor selection registration', async () => {
  // A new URL models a tab loading a refreshed dependency after Vite updates.
  // Use an isolated cache so this never changes the running application's cache.
  const cacheDir = await mkdtemp(join(tmpdir(), 'cms-editor-dependencies-'));
  try {
    const config = await resolveConfig({ cacheDir, logLevel: 'silent', optimizeDeps: { noDiscovery: true } }, 'serve');
    const metadata = await optimizeDeps(config, true);
    const url = pathToFileURL(metadata.optimized['@tiptap/starter-kit'].file).href;
    const first = await import(url + '?revision=first');
    const refreshed = await import(url + '?revision=refreshed');
    assert.equal(first.default.name, 'starterKit');
    assert.equal(refreshed.default.name, 'starterKit');
  } finally {
    await rm(cacheDir, { recursive: true, force: true });
  }
});
