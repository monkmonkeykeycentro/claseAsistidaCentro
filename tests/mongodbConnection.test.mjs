import { test, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

const constructed = [];
const attached = [];
let failure;
let gate;
let connectStarted;
let notifyConnect;
mock.module('mongodb', { namedExports: { MongoClient: class {
  constructor(uri, options) { this.uri = uri; this.options = options; this.closed = 0; this.connects = 0; constructed.push(this); }
  async connect() { this.connects++; notifyConnect(); if (gate) await gate; if (failure) throw failure; return this; }
  async close() { this.closed++; }
  db(name) { return { name }; }
} } });
mock.module('@vercel/functions/db-connections', { namedExports: { attachDatabasePool: (client) => attached.push(client) } });
const { connectDatabase } = await import('../server/mongodb.mjs');
const shared = globalThis[Symbol.for('clase-asistida.mongodb')];

beforeEach((t) => {
  constructed.length = 0; attached.length = 0; failure = undefined; gate = undefined; shared.connection = undefined; shared.retryAt = 0;
  connectStarted = new Promise((resolve) => { notifyConnect = resolve; });
  const before = Object.fromEntries(['MONGODB_URI', 'MONGODB_DB', 'VERCEL'].map((key) => [key, process.env[key]]));
  Object.assign(process.env, { MONGODB_URI: 'mongodb://private-canary', MONGODB_DB: 'test_database', VERCEL: '1' });
  t.after(() => {
    shared.connection = undefined;
    shared.retryAt = 0;
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
});

test('concurrent calls and duplicate module loads share one bounded MongoDB pool', async (t) => {
  let release;
  gate = new Promise((resolve) => { release = resolve; });
  t.after(() => release());
  const anotherModule = await import('../server/mongodb.mjs?duplicate-bundle');
  const requests = Array.from({ length: 40 }, (_, index) => index % 2 ? connectDatabase() : anotherModule.connectDatabase());
  await connectStarted;
  assert.equal(constructed.length, 1);
  assert.equal(attached.length, 1);
  assert.equal(constructed[0].connects, 1);
  assert.deepEqual(constructed[0].options, {
    maxPoolSize: 3, minPoolSize: 0, maxConnecting: 1, maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 5000, serverSelectionTimeoutMS: 10000, appName: 'clase-asistida-api',
  });
  release();
  const connections = await Promise.all(requests);
  assert.ok(connections.every((connection) => connection === connections[0]));
  assert.equal(connections[0].db.name, 'test_database');
});

test('a failed shared connection is closed once, backs off repeated attempts and can recover', async (t) => {
  t.mock.timers.enable({ apis: ['Date'] });
  failure = new Error('private-canary');
  const attempts = await Promise.allSettled(Array.from({ length: 20 }, () => connectDatabase()));
  assert.ok(attempts.every((attempt) => attempt.status === 'rejected'));
  assert.equal(constructed.length, 1);
  assert.equal(constructed[0].closed, 1);
  assert.equal(shared.connection, undefined);
  failure = undefined;
  await assert.rejects(connectDatabase(), { status: 503, code: 'database-busy' });
  assert.equal(constructed.length, 1);
  t.mock.timers.tick(5000);
  const recovered = await connectDatabase();
  assert.equal(constructed.length, 2);
  assert.equal(recovered.client, constructed[1]);
  assert.equal(recovered.client.closed, 0);
});

test('missing configuration never opens a client, and local connections do not attach Vercel lifecycle hooks', async () => {
  delete process.env.MONGODB_URI;
  await assert.rejects(connectDatabase(), { status: 503, code: 'unavailable' });
  assert.equal(constructed.length, 0);
  process.env.MONGODB_URI = 'mongodb://private-canary';
  delete process.env.VERCEL;
  await connectDatabase();
  assert.equal(constructed.length, 1);
  assert.equal(attached.length, 0);
});
