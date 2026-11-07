import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

let startupError;
let verificationError;
const identity = { uid: 'verified-user', email: 'user@example.test' };
mock.module('firebase-admin/app', { namedExports: {
  getApps: () => { if (startupError) throw startupError; return []; },
  initializeApp: () => ({}),
} });
mock.module('firebase-admin/auth', { namedExports: {
  getAuth: () => ({ verifyIdToken: async () => { if (verificationError) throw verificationError; return identity; } }),
} });
const { authenticate } = await import('../server/auth.mjs');

test('authentication separates SDK startup failures from rejected sessions without exposing SDK details', async () => {
  const original = { FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID, FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST };
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  try {
    for (const [sdkCode, code] of [
      ['ERR_REQUIRE_ESM', 'auth-dependency-incompatible'],
      ['ERR_REQUIRE_ASYNC_MODULE', 'auth-dependency-incompatible'],
      ['ERR_MODULE_NOT_FOUND', 'auth-dependency-missing'],
      ['MODULE_NOT_FOUND', 'auth-dependency-missing'],
      ['private-canary', 'auth-initialization-failed'],
    ]) {
      startupError = Object.assign(new Error('private-canary'), { code: sdkCode });
      assert.equal(await authenticate(undefined), null); // Public reads survive SDK failures.
      await assert.rejects(authenticate('Bearer diagnostic-token'), (error) => {
        assert.equal(error.status, 503);
        assert.equal(error.code, code);
        assert.equal(error.isApplicationError, true);
        assert.doesNotMatch(error.message, /private-canary/);
        return true;
      });
    }
    startupError = undefined;
    verificationError = new Error('private-canary');
    await assert.rejects(authenticate('Bearer diagnostic-token'), { status: 401, code: 'unauthenticated' });
    verificationError = undefined;
    assert.equal(await authenticate('Bearer diagnostic-token'), identity);
  } finally {
    startupError = undefined;
    verificationError = undefined;
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('real Firebase Admin and JWKS keys work when requiring ESM is disabled in the server runtime', async () => {
  // No mocks in this child: catch the jwks-rsa -> jose incompatibility that dev
  // Node normally hides with require(ESM) interoperability. No network or DB.
  const source = `
    import assert from 'node:assert/strict';
    import { generateKeyPairSync, sign, verify } from 'node:crypto';
    import { createRequire } from 'node:module';
    import { dataHandler } from './server/handlers.mjs';
    const require = createRequire(import.meta.url);
    const adminRequire = createRequire(require.resolve('firebase-admin/auth'));
    const jwks = adminRequire('jwks-rsa');
    const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'regression-key', alg: 'RS256', use: 'sig' };
    const client = jwks({ cache: false, getKeysInterceptor: async () => [jwk] });
    const key = await client.getSigningKey('regression-key');
    const payload = Buffer.from('signed-regression-payload');
    const signature = sign('RSA-SHA256', payload, privateKey);
    assert.equal(verify('RSA-SHA256', payload, key.getPublicKey(), signature), true);
    assert.equal(verify('RSA-SHA256', Buffer.from('tampered'), key.getPublicKey(), signature), false);
    const response = { statusCode: 200, setHeader() {}, end(body) { this.body = JSON.parse(body); } };
    await dataHandler({ method: 'POST', headers: { authorization: 'Bearer diagnostic-invalid-token' },
      body: { action: 'get', path: 'admins/diagnostic' } }, response);
    assert.equal(response.statusCode, 401);
    assert.equal(response.body.code, 'unauthenticated');
    console.log('authentication-runtime-ok');
  `;
  const { stdout } = await promisify(execFile)(process.execPath, ['--no-experimental-require-module', '--input-type=module', '-e', source], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, FIREBASE_PROJECT_ID: 'test-project', FIREBASE_AUTH_EMULATOR_HOST: '', NODE_ENV: 'production', MONGODB_URI: '', NODE_OPTIONS: '' },
    timeout: 15000,
  });
  assert.match(stdout, /authentication-runtime-ok/);
});
