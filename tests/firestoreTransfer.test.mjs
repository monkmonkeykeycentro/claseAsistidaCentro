import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectCmsDocuments, createFirestoreReader, importToLocal, makeCmsBackup, remapFields } from '../scripts/lib/firestore-transfer.mjs';

const sourceRoot = 'projects/production/databases/named';
const targetRoot = 'projects/demo-clase-asistida/databases/(default)';

test('CMS collection copy handles pagination and descendants beneath missing parents', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push([url, options.method ?? 'GET']);
    const parsed = new URL(url);
    let body = {};
    if (url.endsWith('/documents:listCollectionIds')) {
      body = JSON.parse(options.body).pageToken ? { collectionIds: ['cms_nodes'] }
        : { collectionIds: ['users', 'admins', 'cms_modules'], nextPageToken: 'roots-2' };
    } else if (parsed.pathname.endsWith('/cms_modules')) {
      body = parsed.searchParams.has('pageToken')
        ? { documents: [{ name: `${sourceRoot}/documents/cms_modules/missing` }] }
        : { documents: [{ name: `${sourceRoot}/documents/cms_modules/a`, fields: { title: { stringValue: 'Real' } } }], nextPageToken: 'docs-2' };
    } else if (url.endsWith('/cms_modules/missing:listCollectionIds')) {
      body = { collectionIds: ['content'] };
    } else if (parsed.pathname.endsWith('/cms_modules/missing/content')) {
      body = { documents: [{ name: `${sourceRoot}/documents/cms_modules/missing/content/b`, fields: { active: { booleanValue: false } } }] };
    }
    return { ok: true, json: async () => body };
  };
  const reader = createFirestoreReader({ origin: 'https://firestore.googleapis.com', databaseRoot: sourceRoot, authorization: 'Bearer test', fetchImpl });
  const documents = await collectCmsDocuments(reader);
  assert.deepEqual(documents.map((item) => item.path), ['cms_modules/a', 'cms_modules/missing/content/b']);
  assert.ok(requests.every(([url, method]) => method === 'GET' || (method === 'POST' && url.endsWith(':listCollectionIds'))));
  assert.ok(requests.every(([url]) => !url.includes('/documents/users') && !url.includes('/documents/admins')));
});

test('local imports retain Firestore types and remap references inside nested fields', async () => {
  const fields = {
    count: { integerValue: '9007199254740993' }, createdAt: { timestampValue: '2026-11-06T12:00:00Z' },
    blocks: { arrayValue: { values: [{ mapValue: { fields: { lesson: { referenceValue: `${sourceRoot}/documents/cms_lessons/a` } } } }] } },
    external: { referenceValue: 'projects/external/databases/(default)/documents/data/x' },
    empty: { mapValue: { fields: {} } },
  };
  const remapped = remapFields(fields, sourceRoot, targetRoot);
  const documents = [{ path: 'cms_modules/a', fields }];
  const requests = [];
  await importToLocal({ origin: 'http://127.0.0.1:8080', projectId: 'demo-clase-asistida', documents, sourceRoot,
    fetchImpl: async (url, options) => {
      requests.push(url);
      const saved = JSON.parse(options.body);
      assert.deepEqual(saved.fields, remapped);
      saved.fields.empty = { mapValue: {} };
      return { ok: true, json: async () => saved };
    },
  });
  assert.equal(requests.length, 1);
  assert.equal(remapped.count.integerValue, '9007199254740993');
  assert.equal(remapped.blocks.arrayValue.values[0].mapValue.fields.lesson.referenceValue, `${targetRoot}/documents/cms_lessons/a`);
  assert.equal(remapped.external.referenceValue, fields.external.referenceValue);
  assert.deepEqual(documents[0].fields, fields);
});

test('an import cannot target cloud or credentials collections and detects mismatches', async () => {
  let calls = 0;
  const request = async () => { calls++; return { ok: true, json: async () => ({ fields: {} }) }; };
  const options = { origin: 'http://127.0.0.1:8080', projectId: 'demo-clase-asistida', sourceRoot, fetchImpl: request,
    documents: [{ path: 'cms_modules/a', fields: { title: { stringValue: 'Expected' } } }] };
  await assert.rejects(importToLocal({ ...options, origin: 'https://firestore.googleapis.com' }), /localhost/);
  await assert.rejects(importToLocal({ ...options, projectId: 'production' }), /localhost/);
  await assert.rejects(importToLocal({ ...options, documents: [{ path: 'admins/user', fields: {} }] }), /Ruta/);
  await assert.rejects(importToLocal({ ...options, documents: [{ path: 'cms_modules/../users/u', fields: {} }] }), /Ruta/);
  assert.equal(calls, 0);
  await assert.rejects(importToLocal(options), /no coinciden/);
});

test('portable CMS export contains real document IDs and all editable collections', () => {
  const fields = { id: { stringValue: 'incorrect-in-field' }, title: { stringValue: 'Título' }, visible: { booleanValue: true } };
  const backup = makeCmsBackup([
    { path: 'cms_modules/real-id', fields },
    { path: 'cms_site_content/home_config', fields: { footer: { mapValue: { fields: { visible: { booleanValue: false } } } } } },
    { path: 'cms_nodes/node1', fields },
    { path: 'cms_revisions/rev1', fields },
  ], '2026-11-06T12:00:00Z', 'Admin');
  assert.equal(backup.version, '1.1.0');
  assert.equal(backup.modules[0].id, 'real-id');
  assert.equal(backup.nodes[0].id, 'node1');
  assert.deepEqual(backup.siteContent[0], { key: 'home_config', footer: { visible: false } });
  assert.deepEqual(backup.categories, []);
  assert.deepEqual(backup.nodeRelations, []);
});
