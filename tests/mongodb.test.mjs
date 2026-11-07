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

  // Writes affecting the subscribed document refresh it without waiting for polling.
  const profile = transport.doc(null, 'admins', 'test-admin');
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

test('concurrent reads share a request only within the same session and never retain responses', async () => {
  let token = 'first-session';
  const requests = [];
  let release;
  const barrier = new Promise((resolve) => { release = resolve; });
  const transport = createMongoTransport(async () => token, async (_url, init) => {
    requests.push(init.headers.Authorization);
    await barrier;
    return Response.json({ data: { title: 'Confirmed' } });
  });
  const ref = transport.doc(null, 'cms_site_content', 'home_config');
  const first = transport.getDoc(ref);
  const duplicate = transport.getDoc(ref);
  token = 'second-session';
  const second = transport.getDoc(ref);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(requests, ['Bearer first-session', 'Bearer second-session']);
  release();
  await Promise.all([first, duplicate, second]);
  await transport.getDoc(ref);
  assert.equal(requests.length, 3);
});

test('saving progress does not refresh unrelated CMS or administrator subscriptions', async (t) => {
  const reads = [];
  const transport = createMongoTransport(async () => 'session', async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.action === 'get') { reads.push(body.path); return Response.json({ data: {} }); }
    return Response.json({ ok: true });
  });
  t.after(transport.onSnapshot(transport.doc(null, 'admins', 'editor'), () => {}));
  t.after(transport.onSnapshot(transport.doc(null, 'cms_site_content', 'home_config'), () => {}));
  await new Promise((resolve) => setImmediate(resolve));
  const count = reads.length;
  await transport.setDoc(transport.doc(null, 'users', 'editor', 'progress', 'lesson'), { userId: 'editor' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(reads.length, count);
  await transport.setDoc(transport.doc(null, 'cms_site_content', 'home_config'), { title: 'Changed' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(reads.length, count + 1);
  assert.equal(reads.at(-1), 'cms_site_content/home_config');
});

test('a read following a committed write does not join a pending read from before the write', async () => {
  const waiting = [];
  const transport = createMongoTransport(async () => undefined, async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.action === 'commit') return Response.json({ ok: true });
    return new Promise((resolve) => waiting.push(resolve));
  });
  const ref = transport.doc(null, 'cms_site_content', 'home_config');
  const before = transport.getDoc(ref);
  await new Promise((resolve) => setImmediate(resolve));
  await transport.setDoc(ref, { title: 'Changed' });
  const after = transport.getDoc(ref);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(waiting.length, 2);
  waiting[0](Response.json({ data: { title: 'Before' } }));
  waiting[1](Response.json({ data: { title: 'After' } }));
  assert.equal((await before).data().title, 'Before');
  assert.equal((await after).data().title, 'After');
});

test('a browser burst sends at most four API requests concurrently', async () => {
  let active = 0;
  let peak = 0;
  const waiting = [];
  const transport = createMongoTransport(async () => undefined, async () => {
    active++; peak = Math.max(peak, active);
    await new Promise((resolve) => waiting.push(resolve));
    active--;
    return Response.json({ data: {} });
  });
  const requests = Array.from({ length: 12 }, (_, index) => transport.getDoc(transport.doc(null, 'cms_nodes', `node_${index}`)));
  for (let wave = 0; wave < 3; wave++) {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(waiting.length, 4);
    waiting.splice(0).forEach((resolve) => resolve());
  }
  await Promise.all(requests);
  assert.equal(peak, 4);
  assert.equal(active, 0);
});

test('subscriptions pause in hidden or offline pages and resume once on return', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const before = Object.fromEntries(['window', 'document', 'navigator'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const page = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const browser = new EventTarget();
  const network = { onLine: true };
  for (const [key, value] of Object.entries({ document: page, window: browser, navigator: network })) Object.defineProperty(globalThis, key, { value, configurable: true });
  const paths = [];
  const transport = createMongoTransport(async () => 'session', async (_url, init) => {
    paths.push(JSON.parse(init.body).path);
    return Response.json({ data: {} });
  });
  const stopHome = transport.onSnapshot(transport.doc(null, 'cms_site_content', 'home_config'), () => {});
  const stopAdmin = transport.onSnapshot(transport.doc(null, 'admins', 'editor'), () => {});
  t.after(() => {
    stopHome(); stopAdmin();
    for (const [key, descriptor] of Object.entries(before)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  await settle();
  assert.equal(paths.length, 2);
  t.mock.timers.tick(15000); await settle();
  assert.equal(paths.filter((path) => path === 'admins/editor').length, 2);
  assert.equal(paths.filter((path) => path === 'cms_site_content/home_config').length, 1);
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  const paused = paths.length;
  t.mock.timers.tick(120000); await settle();
  assert.equal(paths.length, paused);
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange')); browser.dispatchEvent(new Event('focus'));
  await settle(); t.mock.timers.tick(0); await settle();
  assert.equal(paths.length, paused + 2);
  network.onLine = false; browser.dispatchEvent(new Event('offline'));
  t.mock.timers.tick(120000); await settle();
  assert.equal(paths.length, paused + 2);
  network.onLine = true; browser.dispatchEvent(new Event('online')); await settle();
  assert.equal(paths.length, paused + 4);
});

test('saturated database responses respect Retry-After instead of immediately retrying queued refreshes', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let reads = 0;
  const transport = createMongoTransport(async () => undefined, async (_url, init) => {
    if (JSON.parse(init.body).action === 'commit') return Response.json({ ok: true });
    reads++;
    return Response.json({ code: 'database-busy' }, { status: 503, headers: { 'Retry-After': '30' } });
  });
  t.after(transport.onSnapshot(transport.doc(null, 'cms_site_content', 'home_config'), () => {}, () => {}));
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  await settle();
  assert.equal(reads, 1);
  t.mock.timers.tick(29000); await settle();
  assert.equal(reads, 1);
  t.mock.timers.tick(1000); await settle();
  assert.equal(reads, 2);
});
