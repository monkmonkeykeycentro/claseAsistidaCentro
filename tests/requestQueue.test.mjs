import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestQueue } from '../src/services/requestQueue.ts';

test('a timed-out queued request leaves its slot available for the next request', async () => {
  const run = createRequestQueue(1);
  let release;
  const busy = run(() => new Promise((resolve) => { release = resolve; }), new AbortController().signal);
  await new Promise((resolve) => setImmediate(resolve));
  const cancelled = new AbortController();
  let started = false;
  const expired = run(async () => { started = true; }, cancelled.signal);
  cancelled.abort(new Error('request-deadline'));
  await assert.rejects(expired, /request-deadline/);
  const next = run(async () => 'next-request', new AbortController().signal);
  release();
  await busy;
  assert.equal(await next, 'next-request');
  assert.equal(started, false);
});
