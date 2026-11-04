import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { sequelize, models, connectMongo, ChatLog, AuditLog, pingDatabases } from '../index.js';
import { mongoose } from '../mongo/index.js';

const { User, Category, Expense } = models;

after(async () => {
  await sequelize.close();
  await mongoose.disconnect();
});

test('both databases answer a ping', async () => {
  assert.deepEqual(await pingDatabases(), { postgres: 'up', mongo: 'up' });
});

test('seeded categories and demo data exist', async () => {
  assert.equal(await Category.count(), 7);
  const demo = await User.findOne({ where: { username: 'demo' } });
  assert.ok(demo);
  assert.equal(demo.passwordHash, undefined);
  assert.ok((await Expense.count({ where: { userId: demo.id } })) >= 60);
});

test('withPassword scope exposes the hash', async () => {
  const demo = await User.scope('withPassword').findOne({ where: { username: 'demo' } });
  assert.match(demo.passwordHash, /^\$2[aby]\$12\$/);
});

test('associations load an expense with its category and user', async () => {
  const expense = await Expense.findOne({ include: [Category, User] });
  assert.ok(expense.Category.name);
  assert.ok(expense.User.username);
});

test('model validation rejects bad usernames and amounts', async () => {
  await assert.rejects(User.build({ username: 'a b', passwordHash: 'x' }).validate());
  await assert.rejects(Expense.build({ amount: 0 }).validate());
  await assert.rejects(Expense.build({ amount: 10000001 }).validate());
});

test('database CHECK rejects an out-of-range amount', async () => {
  const demo = await User.findOne({ where: { username: 'demo' } });
  const category = await Category.findOne();
  await assert.rejects(
    sequelize.query(
      'INSERT INTO expenses (user_id, category_id, description, amount, spent_on) VALUES (:u, :c, :d, :a, now())',
      { replacements: { u: demo.id, c: category.id, d: 'bad', a: -5 } },
    ),
    /expenses_amount_range/,
  );
});

test('row level security is on and anon has no table privileges', async () => {
  const [tables] = await sequelize.query(
    `SELECT c.relname, c.relrowsecurity
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'`,
  );
  assert.ok(tables.length >= 4);
  for (const table of tables) assert.equal(table.relrowsecurity, true, table.relname);

  const [grants] = await sequelize.query(
    `SELECT count(*)::int AS n FROM information_schema.role_table_grants
      WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')`,
  );
  assert.equal(grants[0].n, 0);
});

test('ChatLog rejects an unknown source', async () => {
  await connectMongo();
  const error = new ChatLog({
    userId: 'u1',
    questionChars: 10,
    latencyMs: 5,
    source: 'openai',
    model: 'm',
  }).validateSync();
  assert.ok(error.errors.source);
});

test('AuditLog rejects an unknown event and has a 90 day TTL index', async () => {
  await connectMongo();
  assert.ok(new AuditLog({ event: 'hacked' }).validateSync().errors.event);
  await AuditLog.init();
  const indexes = await AuditLog.collection.indexes();
  const ttl = indexes.find((index) => index.expireAfterSeconds !== undefined);
  assert.equal(ttl.expireAfterSeconds, 90 * 24 * 60 * 60);
});

test('mongoose hardening options are enabled', () => {
  assert.equal(mongoose.get('sanitizeFilter'), true);
  assert.equal(mongoose.get('strictQuery'), true);
  assert.deepEqual(mongoose.sanitizeFilter({ userId: { $ne: null } }), { userId: { $eq: { $ne: null } } });
});
