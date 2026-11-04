import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

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
let alice;
let bob;
let categories;

const call = (who, method, path, body) =>
  fetch(`${base}/api${path}`, {
    method,
    headers: { ...(body && { 'content-type': 'application/json' }), ...(who && { cookie: who.cookie }) },
    body: body && JSON.stringify(body),
  });

async function signUp() {
  const username = `t_${Math.random().toString(36).slice(2, 12)}`;
  const post = (path) =>
    fetch(`${base}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  await post('register');
  created.push(username);
  const login = await post('login');
  const cookie = login.headers.getSetCookie().find((c) => c.startsWith('token=')).split(';')[0];
  return { username, cookie };
}

const monthOf = (offset) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)).toISOString().slice(0, 7);
};

const addExpense = async (who, fields) => {
  const res = await call(who, 'POST', '/expenses', {
    description: 'Lunch',
    amount: 100,
    categoryId: categories[0].id,
    spentOn: `${monthOf(0)}-05`,
    ...fields,
  });
  assert.equal(res.status, 201);
  return (await res.json()).expense;
};

before(async () => {
  await connectMongo();
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  alice = await signUp();
  bob = await signUp();
  categories = (await (await call(alice, 'GET', '/categories')).json()).items;
});

after(async () => {
  server.close();
  await models.User.destroy({ where: { username: created } });
  await sequelize.close();
  await mongoose.disconnect();
});

test('every resource route requires auth', async () => {
  for (const path of ['/categories', '/expenses', '/budget', '/summary', '/export/expenses.csv', '/export/expenses.xml']) {
    assert.equal((await call(null, 'GET', path)).status, 401, path);
  }
});

test('categories returns the seven fixed categories', async () => {
  assert.equal(categories.length, 7);
});

test('expense CRUD round-trip', async () => {
  const expense = await addExpense(alice, { description: 'Coffee', amount: 12.5 });
  assert.equal(expense.amount, 12.5);
  assert.equal(expense.category, categories[0].name);

  const got = await call(alice, 'GET', `/expenses/${expense.id}`);
  assert.equal(got.status, 200);

  const patched = await call(alice, 'PATCH', `/expenses/${expense.id}`, { amount: 20, categoryId: categories[1].id });
  assert.equal(patched.status, 200);
  const after = (await patched.json()).expense;
  assert.equal(after.amount, 20);
  assert.equal(after.category, categories[1].name);

  assert.equal((await call(alice, 'DELETE', `/expenses/${expense.id}`)).status, 204);
  assert.equal((await call(alice, 'GET', `/expenses/${expense.id}`)).status, 404);
});

test("another user's expense id returns 404 for get, patch and delete", async () => {
  const expense = await addExpense(alice);
  assert.equal((await call(bob, 'GET', `/expenses/${expense.id}`)).status, 404);
  assert.equal((await call(bob, 'PATCH', `/expenses/${expense.id}`, { amount: 1 })).status, 404);
  assert.equal((await call(bob, 'DELETE', `/expenses/${expense.id}`)).status, 404);
  assert.equal((await call(alice, 'GET', `/expenses/${expense.id}`)).status, 200);
  const list = await (await call(bob, 'GET', '/expenses')).json();
  assert.equal(list.total, 0);
});

test('invalid bodies, ids and queries return 400', async () => {
  const ok = { description: 'x', amount: 1, categoryId: categories[0].id, spentOn: `${monthOf(0)}-01` };
  for (const bad of [
    { ...ok, amount: -5 },
    { ...ok, amount: '5' },
    { ...ok, description: '' },
    { ...ok, spentOn: '2026-13-40' },
    { ...ok, extra: true },
    { ...ok, categoryId: 99999 },
  ]) {
    assert.equal((await call(alice, 'POST', '/expenses', bad)).status, 400, JSON.stringify(bad));
  }
  assert.equal((await call(alice, 'PATCH', `/expenses/${(await addExpense(alice)).id}`, {})).status, 400);
  assert.equal((await call(alice, 'GET', '/expenses/not-a-uuid')).status, 400);
  assert.equal((await call(alice, 'GET', '/expenses?page=0')).status, 400);
  assert.equal((await call(alice, 'GET', '/expenses?sort=drop_table')).status, 400);
  assert.equal((await call(alice, 'GET', '/expenses?from=yesterday')).status, 400);
  assert.equal((await call(alice, 'PUT', '/budget', { monthlyAmount: -1 })).status, 400);
  assert.equal((await call(alice, 'GET', '/summary?month=2026-13')).status, 400);
});

test('limit=1000 is capped at 50 and pagination reports totals', async () => {
  const res = await call(alice, 'GET', '/expenses?limit=1000');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.limit, 50);
  assert.ok(body.items.length <= 50);
  const paged = await (await call(alice, 'GET', '/expenses?limit=1&page=2')).json();
  assert.equal(paged.page, 2);
  assert.equal(paged.items.length, 1);
  assert.ok(paged.total >= 2);
});

test('search escapes % and _ and filters by category, date and sort', async () => {
  const who = await signUp();
  await addExpense(who, { description: '50% off', amount: 5, spentOn: '2025-01-10' });
  await addExpense(who, { description: '50x off', amount: 50, spentOn: '2025-02-10', categoryId: categories[1].id });
  await addExpense(who, { description: 'snake_case', amount: 7, spentOn: '2025-03-10' });

  const search = async (query) => (await (await call(who, 'GET', `/expenses?${query}`)).json()).items;
  assert.deepEqual((await search('q=50%25')).map((e) => e.description), ['50% off']);
  assert.deepEqual((await search('q=snake_')).map((e) => e.description), ['snake_case']);
  assert.equal((await search('q=_')).length, 1);
  assert.equal((await search(`categoryId=${categories[1].id}`)).length, 1);
  assert.equal((await search('from=2025-02-01&to=2025-02-28')).length, 1);
  assert.deepEqual((await search('sort=amount_desc')).map((e) => e.amount), [50, 7, 5]);
});

test('budget defaults to 0, upserts, and is per user', async () => {
  assert.equal((await (await call(alice, 'GET', '/budget')).json()).budget.monthlyAmount, 0);
  const first = await call(alice, 'PUT', '/budget', { monthlyAmount: 25000 });
  assert.equal((await first.json()).budget.monthlyAmount, 25000);
  const second = await call(alice, 'PUT', '/budget', { monthlyAmount: 30000.5 });
  assert.equal((await second.json()).budget.monthlyAmount, 30000.5);
  assert.equal((await (await call(bob, 'GET', '/budget')).json()).budget.monthlyAmount, 0);
  assert.equal(await models.Budget.count({ where: { userId: (await models.User.findOne({ where: { username: alice.username } })).id } }), 1);
});

test('summary returns month total, per-category totals and a 6-month series', async () => {
  const who = await signUp();
  await addExpense(who, { amount: 100, spentOn: `${monthOf(0)}-02` });
  await addExpense(who, { amount: 50, spentOn: `${monthOf(0)}-03`, categoryId: categories[1].id });
  await addExpense(who, { amount: 30, spentOn: `${monthOf(-2)}-15` });

  const res = await call(who, 'GET', '/summary');
  assert.equal(res.status, 200);
  const summary = await res.json();
  assert.equal(summary.month, monthOf(0));
  assert.equal(summary.total, 150);
  assert.deepEqual(summary.byCategory.map((c) => c.total), [100, 50]);
  assert.equal(summary.series.length, 6);
  assert.equal(summary.series.at(-1).month, monthOf(0));
  assert.equal(summary.series.find((s) => s.month === monthOf(-2)).total, 30);
  assert.equal(summary.series.find((s) => s.month === monthOf(-1)).total, 0);

  const past = await (await call(who, 'GET', `/summary?month=${monthOf(-2)}`)).json();
  assert.equal(past.total, 30);
});

test('csv export streams an attachment, neutralises formulas and parses back', async () => {
  const who = await signUp();
  await addExpense(who, { description: '=HYPERLINK("http://evil")', amount: 9.5 });
  await addExpense(who, { description: 'Plain, with "quotes"', amount: 3 });

  const res = await call(who, 'GET', '/export/expenses.csv');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition'), /^attachment;/);
  assert.match(res.headers.get('content-type'), /^text\/csv/);
  const lines = (await res.text()).trimEnd().split('\r\n');
  assert.equal(lines[0], 'id,date,description,category,amount');
  assert.equal(lines.length, 3);
  assert.ok(lines.some((l) => l.includes(`"'=HYPERLINK(""http://evil"")"`)));
  assert.ok(lines.some((l) => l.includes('"Plain, with ""quotes"""')));
  assert.ok(lines.every((l) => !l.split(',')[2]?.startsWith('=')));
});

test('xml export is escaped well-formed XML attachment', async () => {
  const who = await signUp();
  await addExpense(who, { description: `<b>&"' tag`, amount: 4 });

  const res = await call(who, 'GET', '/export/expenses.xml');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition'), /^attachment;/);
  const xml = await res.text();
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<description>&lt;b&gt;&amp;&quot;&apos; tag</description>'));
  assert.ok(!xml.includes('<b>'));
  assert.match(xml, /<expenses count="1">/);
  assert.match(xml, /<amount>4\.00<\/amount>/);
});
