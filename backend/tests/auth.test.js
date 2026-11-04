import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = 'test-secret-'.padEnd(40, 'x');

const { createApp } = await import('../src/app.js');
const { sequelize, models, connectMongo } = await import('@finsight/database');
const { mongoose } = await import('../../database/mongo/index.js');

const password = 'correct1horse';
const created = [];
let server;
let base;

const post = (path, body, cookie) =>
  fetch(`${base}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie && { cookie }) },
    body: JSON.stringify(body),
  });

const me = (cookie) => fetch(`${base}/api/auth/me`, { headers: cookie ? { cookie } : {} });
const cookieOf = (res) => res.headers.getSetCookie().find((c) => c.startsWith('token=')).split(';')[0];

async function register() {
  const username = `t_${Math.random().toString(36).slice(2, 12)}`;
  const res = await post('register', { username, password });
  assert.equal(res.status, 201);
  created.push(username);
  return username;
}

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

test('register, login, me, logout', async () => {
  const username = await register();

  const login = await post('login', { username, password });
  assert.equal(login.status, 200);
  const setCookie = login.headers.getSetCookie().find((c) => c.startsWith('token='));
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const cookie = cookieOf(login);

  const who = await me(cookie);
  assert.equal(who.status, 200);
  assert.equal((await who.json()).user.username, username);

  assert.equal((await post('logout', {}, cookie)).status, 204);
  assert.equal((await me(cookie)).status, 401);
});

test('register validation and duplicate username', async () => {
  const username = await register();
  assert.equal((await post('register', { username, password })).status, 409);
  assert.equal((await post('register', { username: 'a', password })).status, 400);
  assert.equal((await post('register', { username: 'valid_name', password: 'short1' })).status, 400);
  assert.equal((await post('register', { username: 'valid_name', password: 'allletterspassword' })).status, 400);
});

test('wrong password and unknown user give the same generic 401', async () => {
  const username = await register();
  const wrong = await post('login', { username, password: 'wrong-password1' });
  const unknown = await post('login', { username: 'nobody_here_xyz', password });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual((await wrong.json()).error, (await unknown.json()).error);
});

test('5 failures lock the account even for the right password', async () => {
  const username = await register();
  for (let i = 0; i < 5; i += 1) {
    assert.equal((await post('login', { username, password: 'wrong-password1' })).status, 401);
  }
  assert.equal((await post('login', { username, password })).status, 401);
  const user = await models.User.findOne({ where: { username } });
  assert.ok(user.lockedUntil > new Date());
});

test('no cookie, tampered, expired, wrong-algorithm tokens are rejected', async () => {
  const username = await register();
  const cookie = cookieOf(await post('login', { username, password }));
  const user = await models.User.findOne({ where: { username } });
  const claims = { sub: user.id, tv: user.tokenVersion };
  const secret = process.env.JWT_SECRET;

  assert.equal((await me()).status, 401);
  assert.equal((await me(`${cookie.slice(0, -3)}abc`)).status, 401);
  assert.equal((await me(`token=${jwt.sign(claims, 'other-secret'.padEnd(40, 'y'))}`)).status, 401);
  assert.equal((await me(`token=${jwt.sign(claims, secret, { expiresIn: -10 })}`)).status, 401);
  assert.equal((await me(`token=${jwt.sign(claims, secret, { algorithm: 'HS512' })}`)).status, 401);
  assert.equal((await me(`token=${jwt.sign(claims, null, { algorithm: 'none' })}`)).status, 401);
});

test('token is re-issued when under 10 minutes remain', async () => {
  const username = await register();
  await post('login', { username, password });
  const user = await models.User.findOne({ where: { username } });
  const nearExpiry = jwt.sign({ sub: user.id, tv: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: 120 });
  const res = await me(`token=${nearExpiry}`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.getSetCookie().some((c) => c.startsWith('token=')));
});
