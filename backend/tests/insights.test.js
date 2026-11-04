import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = 'test-secret-'.padEnd(40, 'x');
process.env.GROQ_API_KEY = 'test-key';

const { createApp } = await import('../src/app.js');
const { sequelize, models, connectMongo } = await import('@finsight/database');
const { mongoose } = await import('../../database/mongo/index.js');

const realFetch = globalThis.fetch;
let groq = () => new Response(JSON.stringify({ choices: [{ message: { content: '- ok' } }] }));
let groqCalls = [];
globalThis.fetch = (url, init) => {
  if (String(url).startsWith('https://api.groq.com/')) {
    groqCalls.push(JSON.parse(init.body));
    return Promise.resolve().then(() => groq());
  }
  return realFetch(url, init);
};

const created = [];
let server;
let base;

async function signUp() {
  const username = `t_${Math.random().toString(36).slice(2, 12)}`;
  const post = (path) =>
    realFetch(`${base}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password: 'correct1horse' }),
    });
  await post('register');
  created.push(username);
  const login = await post('login');
  return login.headers.getSetCookie().find((c) => c.startsWith('token=')).split(';')[0];
}

const ask = (cookie, question) =>
  realFetch(`${base}/api/insights`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ question }),
  });

before(async () => {
  await connectMongo();
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await models.User.destroy({ where: { username: created } });
  await sequelize.close();
  await mongoose.disconnect();
});

test('requires auth', async () => {
  assert.equal((await ask('', 'hi')).status, 401);
});

test('success returns the Groq answer and sends no ids or descriptions', async () => {
  groqCalls = [];
  const res = await ask(await signUp(), 'How do I save?');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { answer: '- ok', source: 'groq' });
  const [call] = groqCalls;
  assert.equal(call.max_tokens, 300);
  assert.match(call.messages[1].content, /Question: How do I save\?/);
});

test('timeout falls back to a local tip', async () => {
  groq = () => Promise.reject(new DOMException('timed out', 'TimeoutError'));
  const res = await ask(await signUp(), 'Help');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).source, 'fallback');
});

test('429 from Groq falls back', async () => {
  groq = () => new Response('{}', { status: 429 });
  const res = await ask(await signUp(), 'Help');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).source, 'fallback');
});

test('invalid questions are rejected with 400', async () => {
  const cookie = await signUp();
  assert.equal((await ask(cookie, 'x'.repeat(301))).status, 400);
  assert.equal((await ask(cookie, '   ')).status, 400);
  assert.equal((await ask(cookie, 5)).status, 400);
});

test('the 11th request within the hour is rate limited', async () => {
  groq = () => new Response(JSON.stringify({ choices: [{ message: { content: '- ok' } }] }));
  const cookie = await signUp();
  for (let i = 0; i < 10; i++) assert.equal((await ask(cookie, 'Hi')).status, 200);
  assert.equal((await ask(cookie, 'Hi')).status, 429);
});
