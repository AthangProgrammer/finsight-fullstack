import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'production';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = 'x'.repeat(32);

const { createApp } = await import('../src/app.js');
const { errorHandler } = await import('../src/middleware/errorHandler.js');
const { HttpError } = await import('../src/lib/HttpError.js');
const { z } = await import('zod');

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

function run(err) {
  const out = {};
  const res = {
    headersSent: false,
    status(code) {
      out.status = code;
      return res;
    },
    json(body) {
      out.body = body;
      return res;
    },
  };
  errorHandler(err, { id: 'r1' }, res, () => {});
  return out;
}

test('healthz returns 200 with helmet headers and no x-powered-by', async () => {
  const res = await fetch(`${base}/healthz`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-powered-by'), null);
  assert.ok(res.headers.get('content-security-policy'));
  assert.ok(res.headers.get('x-content-type-options'));
});

test('unknown route returns JSON 404', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /json/);
});

test('malformed JSON returns 400', async () => {
  const res = await fetch(`${base}/api/auth`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{bad',
  });
  assert.equal(res.status, 400);
});

test('errorHandler maps zod, HttpError and unknown errors', () => {
  const zodErr = z.object({ a: z.string() }).safeParse({}).error;
  assert.equal(run(zodErr).status, 400);
  assert.equal(run(new HttpError(409, 'dup')).status, 409);
  const unknown = run(new Error('boom'));
  assert.equal(unknown.status, 500);
  assert.equal(unknown.body.stack, undefined);
  assert.equal(unknown.body.requestId, 'r1');
});
