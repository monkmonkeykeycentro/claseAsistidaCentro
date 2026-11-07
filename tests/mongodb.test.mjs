import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BSON } from 'mongodb';
import { createMongoTransport } from '../src/services/mongoTransport.ts';
import { mergeData, parsePath, validateData } from '../server/dataModel.mjs';
import { decodeValue, digest, parseSnapshot, summarize } from '../scripts/migration-data.mjs';

test('migration retains paths, nested ownership, raw IDs and exact Firestore values', () => {
  const snapshot = { format: 'firestore-local-snapshot/1', documents: [
    { path: 'users/alice/progress/topic', fields: { userId: { stringValue: 'alice' }, id: { stringValue: 'original-id' },
      large: { integerValue: '9223372036854775807' }, timestamp: { timestampValue: '2026-11-06T18:24:24.123456789Z' },
      bytes: { bytesValue: 'YWJj' }, nested: { mapValue: { fields: { empty: { arrayValue: {} }, value: { nullValue: null } } } } } },
  ] };
  const [document] = parseSnapshot(snapshot);
  assert.equal(document._id, 'users/alice/progress/topic');
  assert.equal(document.parentPath, 'users/alice/progress');
  assert.equal(document.data.id, 'original-id');
  assert.equal(document.data.large.toString(), '9223372036854775807');
  assert.equal(document.data.timestamp, '2026-11-06T18:24:24.123456789Z');
  assert.equal(document.data.bytes.toString(), 'abc');
  assert.deepEqual(document.data.nested, { empty: [], value: null });
  assert.equal(digest(document), digest(BSON.EJSON.parse(BSON.EJSON.stringify(document, { relaxed: false }), { relaxed: false })));
  assert.deepEqual(summarize([document]).collections, { users_progress: 1 });
  assert.throws(() => parseSnapshot({ ...snapshot, documents: [...snapshot.documents, ...snapshot.documents] }), /repetida/);
  assert.throws(() => parseSnapshot({ ...snapshot, documents: [{ path: 'unexpected/a', fields: {} }] }), /no admitida/);
  assert.throws(() => decodeValue({ unknown: 1 }), /Tipo de Firestore/);
  assert.equal(decodeValue({ doubleValue: 'NaN' }).valueOf().toString(), 'NaN');
});

test('data validation rejects injection and invalid paths while merge preserves nested sibling fields', () => {
  for (const path of ['users', 'users/alice/private/x', 'admins/alice/extra/x', 'cms_nodes/a.b', 'users/../progress/a']) assert.throws(() => parsePath(path));
  assert.equal(parsePath('users/alice/curriculum_evidences/u2-e2').collection, 'users_curriculum_evidences');
  for (const data of [{ '$set': 1 }, { 'a.b': 2 }, JSON.parse('{"__proto__":{"admin":true}}'), { value: Infinity }]) assert.throws(() => validateData(data));
  assert.deepEqual(mergeData({ settings: { a: 1, b: 2 }, array: [1] }, { settings: { a: 3 }, array: [], empty: {} }), { settings: { a: 3, b: 2 }, array: [], empty: {} });
});

test('Mongo transport sends verified bearer tokens and reads every page before ordering', async () => {
  const requests = [];
  const transport = createMongoTransport(async () => 'firebase-token', async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push({ url, init, body });
    return Response.json(body.cursor ? { documents: [{ path: 'users/alice/class_designs/b', data: { updatedAt: '2026-02' } }] }
      : { documents: [{ path: 'users/alice/class_designs/a', data: { updatedAt: '2026-01' } }], cursor: 'users/alice/class_designs/a' });
  });
  const result = await transport.getDocs(transport.query(transport.collection(null, 'users', 'alice', 'class_designs'), transport.orderBy('updatedAt', 'desc')));
  assert.deepEqual(result.docs.map((doc) => doc.id), ['b', 'a']);
  assert.equal(result.size, 2);
  assert.equal(requests[0].url, '/api/data');
  assert.equal(requests[0].init.headers.Authorization, 'Bearer firebase-token');
  assert.equal(requests[1].body.cursor, 'users/alice/class_designs/a');
});

test('Mongo transport commits a batch in one request and propagates denied writes', async () => {
  const requests = [];
  let deny = false;
  const transport = createMongoTransport(async () => undefined, async (_url, init) => {
    requests.push(JSON.parse(init.body));
    return deny ? Response.json({ code: 'permission-denied', error: 'No autorizado' }, { status: 403 }) : Response.json({ ok: true });
  });
  const batch = transport.writeBatch();
  batch.set(transport.doc(null, 'cms_nodes', 'a'), { title: 'A' });
  batch.delete(transport.doc(null, 'cms_nodes', 'b'));
  await batch.commit();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].operations.length, 2);
  deny = true;
  await assert.rejects(transport.setDoc(transport.doc(null, 'cms_nodes', 'a'), {}), { code: 'permission-denied' });
});

test('Mongo subscriptions emit absent documents and cancel polling cleanly', async () => {
  const transport = createMongoTransport(async () => undefined, async () => Response.json({ data: null }));
  let stop;
  const snapshot = await new Promise((resolve, reject) => {
    stop = transport.onSnapshot(transport.doc(null, 'cms_site_content', 'missing'), resolve, reject);
  });
  stop();
  assert.equal(snapshot.exists(), false);
  assert.equal(snapshot.data(), undefined);
});

test('Mongo subscriptions restore verified admin membership after a failed read with unchanged data', async (t) => {
  let failRead = false;
  const transport = createMongoTransport(async () => 'verified-session', async (_url, init) => {
    const { action } = JSON.parse(init.body);
    if (action === 'commit') return Response.json({ ok: true });
    return failRead
      ? Response.json({ code: 'database-unreachable' }, { status: 503 })
      : Response.json({ data: { configured: true } });
  });
  const roles = [];
  const errors = [];
  const stop = transport.onSnapshot(transport.doc(null, 'admins', 'test-admin'), (snapshot) => {
    roles.push(snapshot.exists() && !snapshot.metadata.fromCache ? 'admin' : 'student');
  }, (error) => {
    errors.push(error.code);
    roles.push('student');
  });
  t.after(stop);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(roles, ['admin']);

  // Successful writes also refresh subscriptions without waiting for the polling timer.
  const profile = transport.doc(null, 'users', 'test-admin');
  failRead = true;
  await transport.setDoc(profile, { displayName: 'Test' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(errors, ['database-unreachable']);
  assert.deepEqual(roles, ['admin', 'student']);

  failRead = false;
  await transport.setDoc(profile, { displayName: 'Test' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(roles, ['admin', 'student', 'admin']);
});
