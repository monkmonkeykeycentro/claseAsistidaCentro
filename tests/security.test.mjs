import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isConfiguredAdmin, isPrivateField, publicDocument } from '../server/security.mjs';
import { publicEnvironment, validateProductionEnvironment } from '../scripts/public-environment.mjs';
import { safeErrorCode } from '../src/utils/safeError.ts';
import { P5LiveThumbnail } from '../src/components/generative/P5LiveThumbnail.tsx';

test('only explicitly allowed environment variables can reach the browser', () => {
  const environment = { VITE_DATA_BACKEND: 'mongodb', VITE_FIREBASE_PROJECT_ID: 'test-project', VITE_FIREBASE_API_KEY: 'public-web-key', VITE_FIREBASE_APP_ID: 'test-app', VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    MONGODB_URI: 'private-canary', CMS_ADMIN_UIDS: 'private-admin-canary', VITE_MONGODB_URI: 'accidental-secret-canary', VITE_CLIENT_SECRET: 'accidental-secret-canary' };
  const exposed = JSON.stringify(publicEnvironment(environment));
  assert.doesNotMatch(exposed, /private-canary|private-admin-canary|accidental-secret-canary/);
  assert.match(exposed, /public-web-key/);
  validateProductionEnvironment(environment);
  assert.throws(() => validateProductionEnvironment({ ...environment, VITE_DATA_BACKEND: 'firestore' }), /protección/);
  assert.throws(() => validateProductionEnvironment({ ...environment, FIREBASE_PROJECT_ID: 'other-project' }), /mismo proyecto/);
});

test('public documents omit audit identities and secrets, including serialized templates', () => {
  const source = { title: 'Public lesson', updatedBy: 'private-canary', metadata: { ownerUid: 'private-canary', publicValue: 'keep' },
    content: JSON.stringify({ defaultProject: { userId: 'private-canary', className: 'Creature' }, access_token: 'private-canary' }) };
  const projected = publicDocument(source, 'cms_site_content');
  assert.doesNotMatch(JSON.stringify(projected), /private-canary/);
  assert.equal(projected.metadata.publicValue, 'keep');
  assert.equal(JSON.parse(projected.content).defaultProject.className, 'Creature');
  assert.equal(source.updatedBy, 'private-canary');
  assert.equal(isPrivateField('metadata.owner_uid'), true);
  assert.equal(isPrivateField('updatedBy'), true);
  assert.equal(isPrivateField('sectionId'), false);
});

test('administrator configuration matches verified UID and never trusts email or profile roles', () => {
  assert.equal(isConfiguredAdmin({ uid: 'alice' }, { CMS_ADMIN_UIDS: 'alice,bob' }), true);
  assert.equal(isConfiguredAdmin({ uid: 'mallory', role: 'admin', email_verified: true, email: 'admin@example.test' }, { CMS_ADMIN_UIDS: 'alice' }), false);
  assert.equal(isConfiguredAdmin(null, { CMS_ADMIN_UIDS: 'alice' }), false);
  assert.throws(() => isConfiguredAdmin({ uid: 'alice' }, { CMS_ADMIN_UIDS: 'bad/path' }), /Configuración/);
});

test('sketch execution has an opaque origin and escapes HTML script terminators', () => {
  const markup = renderToStaticMarkup(React.createElement(P5LiveThumbnail, { p5Code: 'const attack = "</script><script>parent.leak()</script>";' }));
  assert.match(markup, /sandbox="allow-scripts"/);
  assert.doesNotMatch(markup, /allow-same-origin/);
  assert.match(markup, /\\u003c\/script/);
  assert.match(markup, /referrerPolicy="no-referrer"/i);
});

test('SDK error objects and token-bearing messages never become diagnostic output', () => {
  assert.equal(safeErrorCode({ code: 'auth/invalid-credential', customData: { accessToken: 'private-canary' } }), 'auth/invalid-credential');
  assert.equal(safeErrorCode(new Error('private-canary')), 'unknown-error');
  assert.equal(safeErrorCode({ code: 'auth/error?token=private-canary' }), 'unknown-error');
});
