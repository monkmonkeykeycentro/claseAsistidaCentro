import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let databaseError;
mock.module('../server/mongodb.mjs', { namedExports: {
  connectDatabase: async () => {
    if (databaseError) throw databaseError;
    return { db: { command: async () => ({ ok: 1 }) } };
  },
} });
const { default: health } = await import('../api/health.mjs');
const { default: data } = await import('../api/data.mjs');
const { sendApiError } = await import('../server/handlers.mjs');

function response() {
  return { statusCode: 200, headers: {}, headersSent: false, body: '',
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    end(value = '') { this.body += value; this.headersSent = true; },
    json() { return JSON.parse(this.body); },
  };
}
async function withEnvironment(values, callback) {
  const old = new Map(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  try { return await callback(); }
  finally { for (const [key, value] of old) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
}
const configured = { MONGODB_URI: 'mongodb://localhost:27017', MONGODB_DB: 'test_database', FIREBASE_PROJECT_ID: 'test-project', VITE_FIREBASE_PROJECT_ID: undefined, FIREBASE_AUTH_EMULATOR_HOST: undefined };

test('health reports missing server variable names without loading a database driver or exposing values', async () => {
  await withEnvironment({ ...configured, MONGODB_DB: undefined, FIREBASE_PROJECT_ID: undefined }, async () => {
    const res = response();
    await health({ method: 'GET' }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.json().code, 'server-configuration-missing');
    assert.deepEqual(res.json().missing, ['MONGODB_DB', 'FIREBASE_PROJECT_ID']);
    assert.doesNotMatch(res.body, /mongodb:\/\/localhost|test_database|test-project/);
    assert.equal(res.headers['cache-control'], 'no-store');
  });
});

test('native health handler detects mismatched Firebase projects and production emulator configuration', async () => {
  await withEnvironment({ ...configured, VITE_FIREBASE_PROJECT_ID: 'other-project' }, async () => {
    const res = response(); await health({ method: 'GET' }, res);
    assert.equal(res.json().code, 'firebase-project-mismatch');
    assert.doesNotMatch(res.body, /test-project|other-project/);
  });
  await withEnvironment({ ...configured, VERCEL: '1', FIREBASE_AUTH_EMULATOR_HOST: 'private-canary' }, async () => {
    const res = response(); await health({ method: 'GET' }, res);
    assert.equal(res.json().code, 'auth-emulator-not-allowed');
    assert.doesNotMatch(res.body, /private-canary/);
  });
});

test('health returns a successful ping and distinguishes Atlas failures using safe error codes', async () => {
  const previousLog = console.error;
  const logs = [];
  console.error = (message) => logs.push(message);
  try {
    await withEnvironment(configured, async () => {
      const ready = response(); await health({ method: 'GET' }, ready);
      assert.deepEqual(ready.json(), { ok: true, backend: 'mongodb' });
      for (const [details, expected] of [
        [{ name: 'MongoServerError', code: 18 }, 'database-authentication-failed'],
        [{ name: 'MongoServerError', code: 13 }, 'database-permission-denied'],
        [{ name: 'MongoServerSelectionError' }, 'database-unreachable'],
        [{ code: 'EREFUSED' }, 'database-unreachable'],
        [{ name: 'MongoParseError' }, 'database-configuration-invalid'],
        [{ name: 'MongoWaitQueueTimeoutError' }, 'database-busy'],
        [{ code: 'ERR_MODULE_NOT_FOUND' }, 'dependency-missing'],
      ]) {
        databaseError = Object.assign(new Error('private-canary'), details);
        const res = response(); await health({ method: 'GET' }, res);
        assert.equal(res.statusCode, 503);
        assert.equal(res.json().code, expected);
        if (expected === 'database-busy') assert.equal(res.headers['retry-after'], '5');
        assert.doesNotMatch(res.body, /private-canary/);
      }
    });
    assert.doesNotMatch(JSON.stringify(logs), /private-canary/);
  } finally { databaseError = undefined; console.error = previousLog; }
});

test('native data handler accepts Vercel and stream bodies, rejects malformed JSON and enforces HTTP methods', async () => {
  for (const entrypoint of [health, data]) {
    const res = response(); await entrypoint({ method: 'DELETE' }, res);
    assert.equal(res.statusCode, 405);
  }
  for (const body of ['{', Buffer.from('{')]) {
    const res = response(); await data({ method: 'POST', headers: {}, body }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, 'JSON no válido.');
  }
  const req = Readable.from(['{']); Object.assign(req, { method: 'POST', headers: {} });
  const malformed = response(); await data(req, malformed);
  assert.equal(malformed.statusCode, 400);
  const noSession = response();
  await data({ method: 'POST', headers: { authorization: 'Basic private-canary' }, body: { action: 'get' } }, noSession);
  assert.equal(noSession.statusCode, 401);
  assert.doesNotMatch(noSession.body, /private-canary/);
});

test('untrusted SDK errors cannot use a status field to leak their messages', () => {
  const previousLog = console.error; console.error = () => {};
  try {
    const res = response();
    sendApiError(res, Object.assign(new Error('private-canary'), { status: 503, code: 'sdk-error' }));
    assert.equal(res.statusCode, 503);
    assert.doesNotMatch(res.body, /private-canary|sdk-error/);
  } finally { console.error = previousLog; }
});

test('function entry points survive missing server files and failed SDK imports without leaking startup errors', async () => {
  const previousLog = console.error;
  const logs = [];
  console.error = (message) => logs.push(message);
  try {
    for (const endpoint of ['health', 'data']) for (const scenario of ['missing', 'broken', 'success']) {
      const root = await mkdtemp(path.join(tmpdir(), 'clase-function-test-'));
      try {
        await mkdir(path.join(root, 'api'));
        await writeFile(path.join(root, 'api', `${endpoint}.mjs`), await readFile(new URL(`../api/${endpoint}.mjs`, import.meta.url)));
        if (scenario !== 'missing') {
          await mkdir(path.join(root, 'server'));
          const source = scenario === 'broken'
            ? "throw Object.assign(new Error('private-canary'),{code:'ERR_MODULE_NOT_FOUND'});"
            : `export async function ${endpoint}Handler(req,res){await new Promise(resolve=>setTimeout(resolve,5));res.end(JSON.stringify({ok:true}));}`;
          await writeFile(path.join(root, 'server', 'handlers.mjs'), source);
        }
        const handler = (await import(pathToFileURL(path.join(root, 'api', `${endpoint}.mjs`)).href)).default;
        const res = response(); await handler({}, res);
        if (scenario === 'success') assert.equal(res.json().ok, true);
        else {
          assert.equal(res.statusCode, 503);
          assert.equal(res.json().code, 'api-initialization-failed');
          assert.equal(res.json().reason, 'dependency-missing');
          assert.doesNotMatch(res.body, /private-canary|clase-function-test/);
        }
      } finally { await rm(root, { recursive: true, force: true }); }
    }
    assert.doesNotMatch(JSON.stringify(logs), /private-canary/);
  } finally { console.error = previousLog; }
});
