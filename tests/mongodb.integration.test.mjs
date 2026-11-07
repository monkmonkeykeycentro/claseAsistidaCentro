import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { MongoClient } from 'mongodb';
import { createDataService } from '../server/dataService.mjs';
import { storedDocument } from '../server/dataModel.mjs';

const uri = process.env.MONGODB_TEST_URI;
const run = promisify(execFile);
test('real MongoDB: public visibility, ownership, admin authorization, atomic writes and migration roundtrip', { skip: !uri }, async () => {
  // This test only creates/drops its own random database on an explicitly local server.
  assert.match(uri, /^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//);
  const client = await new MongoClient(uri).connect();
  const databaseName = `migration_test_${randomUUID().replaceAll('-', '')}`;
  const db = client.db(databaseName);
  const temporary = await mkdtemp(path.join(tmpdir(), 'clase-mongo-test-'));
  const user = { uid: 'alice', email: 'alice@centro.edu.mx', email_verified: true };
  const admin = { uid: 'editor', email: 'editor@centro.edu.mx', email_verified: true };
  const execute = (body, identity = null) => createDataService(db, client)(body, identity);
  const get = (path) => ({ action: 'get', path });
  const list = (path, constraints = []) => ({ action: 'list', path, constraints });
  const set = (path, data, merge = false) => ({ type: 'set', path, data, merge });
  const commit = (operations, identity) => execute({ action: 'commit', operations }, identity);
  async function seed(path, data) { const collection = path.startsWith('users/') && path.split('/').length === 4 ? `users_${path.split('/')[2]}` : path.split('/')[0]; await db.collection(collection).insertOne(storedDocument(path, data)); }
  try {
    for (const [path, data] of [
      ['admins/editor', {}], ['cms_modules/module', { status: 'published', visible: true }],
      ['cms_lessons/lesson', { status: 'published', visible: true, moduleId: 'module' }],
      ['cms_sections/section', { visible: true, lessonId: 'lesson' }], ['cms_blocks/block', { sectionId: 'section', content: 'Public' }],
      ['cms_nodes/hidden', { status: 'draft', visible: true }], ['cms_node_blocks/hidden_block', { nodeId: 'hidden', text: 'Secret' }],
      ['users/alice', { uid: 'alice', email: user.email, displayName: 'Alice', role: 'admin' }],
    ]) await seed(path, data);
    assert.equal((await execute(get('cms_blocks/block'))).data.content, 'Public');
    await assert.rejects(execute(get('cms_node_blocks/hidden_block')), { code: 'permission-denied' });
    assert.equal((await execute(list('cms_nodes'))).documents.length, 0);
    assert.equal((await execute(list('cms_nodes'), admin)).documents.length, 1);
    await assert.rejects(execute(get('users/alice')), { code: 'permission-denied' });
    await assert.rejects(execute(list('users'), user), { code: 'permission-denied' });
    await assert.rejects(commit([set('admins/alice', {})], user), { code: 'permission-denied' });
    await assert.rejects(commit([set('cms_nodes/spoof', { title: 'Spoof' })], user), { code: 'permission-denied' });
    await assert.rejects(commit([set('users/bob/progress/topic', { userId: 'bob' })], user), { code: 'permission-denied' });
    await assert.rejects(commit([set('users/alice/progress/topic', { userId: 'bob' })], user), { code: 'permission-denied' });
    await commit([set('users/alice/progress/topic', { userId: 'alice', completed: true })], user);
    assert.equal((await execute(get('users/alice/progress/topic'), user)).data.completed, true);
    await assert.rejects(execute(get('users/alice/progress/topic'), { uid: 'bob' }), { code: 'permission-denied' });
    await commit([set('cms_nodes/published', { status: 'published', visible: true, settings: { a: 1, b: 2 } })], admin);
    await commit([set('cms_nodes/published', { settings: { a: 3 } }, true)], admin);
    assert.deepEqual((await execute(get('cms_nodes/published'))).data.settings, { a: 3, b: 2 });
    await commit([set('cms_nodes/published', { updatedBy: 'private-canary', metadata: { ownerUid: 'private-canary' } }, true)], admin);
    assert.doesNotMatch(JSON.stringify(await execute(get('cms_nodes/published'))), /private-canary/);
    assert.match(JSON.stringify(await execute(get('cms_nodes/published'), admin)), /private-canary/);
    await assert.rejects(execute(list('cms_nodes', [{ kind: 'where', field: 'updatedBy', op: '==', value: 'private-canary' }])), { code: 'permission-denied' });
    const previousAdmins = process.env.CMS_ADMIN_UIDS;
    process.env.CMS_ADMIN_UIDS = 'configured-editor';
    try {
      assert.equal((await execute(get('admins/configured-editor'), { uid: 'configured-editor' })).data.configured, true);
      assert.equal((await execute(get('cms_nodes/published'), { uid: 'configured-editor' })).data.updatedBy, 'private-canary');
      await assert.rejects(execute(get('admins/configured-editor'), user), { code: 'permission-denied' });
    } finally { if (previousAdmins === undefined) delete process.env.CMS_ADMIN_UIDS; else process.env.CMS_ADMIN_UIDS = previousAdmins; }
    await assert.rejects(commit([
      set('users/alice/progress/atomic', { userId: 'alice' }), set('cms_nodes/forbidden', { title: 'No' }),
    ], user), { code: 'permission-denied' });
    assert.equal((await execute(get('users/alice/progress/atomic'), user)).data, null);
    await assert.rejects(execute(list('cms_nodes', [{ kind: 'where', field: 'status', op: '==', value: { $ne: 'draft' } }])), { code: 'invalid-argument' });
    await commit([set('cms_modules/module', { status: 'draft' }, true)], admin);
    await assert.rejects(execute(get('cms_blocks/block')), { code: 'permission-denied' });
    await commit([set('cms_modules/module', { status: 'published' }, true)], admin);
    const many = Array.from({ length: 205 }, (_, index) => storedDocument(`cms_site_content/item_${String(index).padStart(3, '0')}`, { key: index }));
    await db.collection('cms_site_content').insertMany(many);
    const page1 = await execute(list('cms_site_content'));
    assert.equal(page1.documents.length, 200);
    const page2 = await execute({ ...list('cms_site_content'), cursor: page1.cursor });
    assert.equal(page2.documents.length, 5);
    assert.equal(page2.cursor, undefined);

    const file = path.join(temporary, 'snapshot.json');
    const snapshot = { format: 'firestore-local-snapshot/1', documents: [
      { path: 'cms_nodes/imported', fields: { title: { stringValue: 'Imported' }, number: { integerValue: '9223372036854775807' } } },
      { path: 'users/alice/class_designs/design', fields: { userId: { stringValue: 'alice' }, className: { stringValue: 'Creature' } } },
    ] };
    await writeFile(file, JSON.stringify(snapshot));
    const environment = { ...process.env, MONGODB_URI: uri, MONGODB_DB: databaseName };
    const cli = async (command, ...extra) => run(process.execPath, ['scripts/mongodb-migrate.mjs', command, file, ...extra], { env: environment });
    await cli('import');
    await cli('import');
    assert.match((await cli('verify')).stdout, /"verified": 2/);
    assert.equal((await execute(get('users/alice/class_designs/design'), user)).data.className, 'Creature');
    await db.collection('cms_nodes').updateOne({ _id: 'cms_nodes/imported' }, { $set: { 'data.title': 'Changed in destination' } });
    await assert.rejects(cli('import'), /documentos diferentes/);
    assert.equal((await execute(get('cms_nodes/imported'), admin)).data.title, 'Changed in destination');
    await cli('import', '--overwrite');
    await cli('verify');
    assert.equal((await execute(get('cms_nodes/imported'), admin)).data.title, 'Imported');
    assert.ok(await db.collection('cms_nodes').findOne({ _id: 'cms_nodes/published' }), 'extra destination documents survive import');
    const transfer = (...args) => run(process.execPath, ['scripts/mongodb-transfer-user.mjs', 'alice', 'bob', ...args], { env: environment });
    assert.match((await transfer()).stdout, /"mode": "dry-run"/);
    assert.equal((await execute(get('users/bob/class_designs/design'), { uid: 'bob' })).data, null);
    await transfer('--apply');
    await transfer('--apply');
    assert.equal((await execute(get('users/bob/class_designs/design'), { uid: 'bob' })).data.userId, 'bob');
    assert.equal((await execute(get('users/alice/class_designs/design'), user)).data.userId, 'alice');
    await db.collection('users_class_designs').updateOne({ _id: 'users/bob/class_designs/design' }, { $set: { 'data.className': 'Changed by Bob' } });
    await assert.rejects(transfer('--apply'), /No se sobrescribirán/);

    const previousEnvironment = { uri: process.env.MONGODB_URI, db: process.env.MONGODB_DB, emulator: process.env.FIREBASE_AUTH_EMULATOR_HOST, project: process.env.FIREBASE_PROJECT_ID };
    process.env.MONGODB_URI = uri;
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.MONGODB_DB = databaseName;
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const { app } = await import('../server/app.mjs');
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const request = (body, token) => fetch(`${base}/api/data`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
      assert.equal((await fetch(`${base}/api/health`)).status, 200);
      const publicResponse = await request(get('cms_blocks/block'));
      assert.equal(publicResponse.status, 200);
      assert.equal(publicResponse.headers.get('cache-control'), 'no-store');
      assert.equal((await request(get('users/alice'))).status, 403);
      assert.equal((await request(get('users/alice'), 'forged-token')).status, 401);
      assert.doesNotMatch(JSON.stringify(await (await request(get('cms_nodes/published'))).json()), /private-canary/);
      const malformed = await fetch(`${base}/api/data`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
      assert.equal(malformed.status, 400);
      assert.equal((await malformed.json()).error, 'JSON no válido.');
    } finally {
      await new Promise((resolve) => server.close(resolve));
      const { client: apiClient } = await (await import('../server/mongodb.mjs')).connectDatabase();
      await apiClient.close();
      for (const [key, value] of [['MONGODB_URI', previousEnvironment.uri], ['MONGODB_DB', previousEnvironment.db], ['FIREBASE_AUTH_EMULATOR_HOST', previousEnvironment.emulator], ['FIREBASE_PROJECT_ID', previousEnvironment.project]]) {
        if (value === undefined) delete process.env[key]; else process.env[key] = value;
      }
    }
  } finally {
    await db.dropDatabase();
    await client.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
