import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensurePublicDriveImage } from '../src/services/driveSharing.ts';

function drive({ permissions = [{ id: 'owner', type: 'user', role: 'owner' }], mimeType = 'image/png', denied = false, ineffective = false } = {}) {
  const calls = [];
  let current = structuredClone(permissions);
  const request = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (!path.includes('/permissions')) return { id: 'image-1', name: 'Imagen.png', mimeType, webViewLink: 'https://drive.google.com/file/d/image-1/view?resourcekey=public-key' };
    if (!options.method) return { permissions: current };
    if (denied) throw new Error('Google Drive respondió 403: organization policy');
    const permission = { ...(options.method === 'PATCH' ? current.find(item => path.includes('/' + item.id + '?')) : { id: 'public-link' }), ...JSON.parse(options.body) };
    if (!ineffective) current = [...current.filter(item => item.id !== permission.id), permission];
    return permission;
  };
  return { request, calls, permissions: () => current };
}

test('publishing an image grants anyone reader access without changing owner permissions or the folder', async () => {
  const api = drive();
  const result = await ensurePublicDriveImage('image-1', api.request);
  const mutation = api.calls.find(item => item.method);
  assert.equal(mutation.method, 'POST');
  assert.deepEqual(JSON.parse(mutation.body), { type: 'anyone', role: 'reader', allowFileDiscovery: false });
  assert.equal(api.permissions().find(item => item.id === 'owner').role, 'owner');
  assert.ok(api.calls.every(item => item.path.startsWith('/files/image-1')));
  assert.equal(result.publicRead, true);
  assert.ok(result.webViewLink.includes('resourcekey=public-key'));
});

test('an existing public writer is downgraded to reader and a repeat call is idempotent', async () => {
  const api = drive({ permissions: [{ id: 'public-link', type: 'anyone', role: 'writer', allowFileDiscovery: true }] });
  await ensurePublicDriveImage('image-1', api.request);
  assert.equal(api.calls.find(item => item.method).method, 'PATCH');
  assert.equal(api.permissions()[0].role, 'reader');
  assert.equal(api.permissions()[0].allowFileDiscovery, false);
  api.calls.length = 0;
  await ensurePublicDriveImage('image-1', api.request);
  assert.ok(api.calls.every(item => !item.method));
});

test('non-image files and malformed file IDs cannot be made public by the image action', async () => {
  const api = drive({ mimeType: 'application/pdf' });
  await assert.rejects(ensurePublicDriveImage('image-1', api.request), /limitada a imágenes/);
  assert.ok(api.calls.every(item => !item.path.includes('/permissions')));
  api.calls.length = 0;
  await assert.rejects(ensurePublicDriveImage('../folder', api.request), /no es válido/);
  assert.equal(api.calls.length, 0);
});

test('sharing denials and ineffective inherited permissions never report public read success', async () => {
  await assert.rejects(ensurePublicDriveImage('image-1', drive({ denied: true }).request), /403/);
  await assert.rejects(ensurePublicDriveImage('image-1', drive({ ineffective: true }).request), /no confirmó/);
});

test('permission pagination finds an existing reader without creating duplicate public grants', async () => {
  const calls = [];
  const request = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (!path.includes('/permissions')) return { id: 'image-1', name: 'Imagen.png', mimeType: 'image/png', webViewLink: 'https://drive.google.com/file/d/image-1/view' };
    return path.includes('pageToken=second') ? { permissions: [{ id: 'public-link', type: 'anyone', role: 'reader' }] } : { permissions: [{ id: 'owner', type: 'user', role: 'owner' }], nextPageToken: 'second' };
  };
  assert.equal((await ensurePublicDriveImage('image-1', request)).publicRead, true);
  assert.ok(calls.every(item => !item.method));
});
