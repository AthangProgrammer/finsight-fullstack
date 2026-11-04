import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const summary = load('summary');
const budget = load('budget');
const categories = load('categories');
const expenses = load('expenses');

const legacyExpenses = expenses.items.map((item) => ({
  id: item.id,
  description: item.description,
  amount: item.amount,
  category: item.category,
  created_at: item.spentOn,
}));

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
};

const server = createServer((req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://mock');
  const signedIn = /(^|; )token=/.test(req.headers.cookie ?? '');
  const legacySignedIn = Boolean(req.headers.authorization);

  if (pathname === '/login') return send(res, 200, { access_token: 'mock' });
  if (pathname === '/me') return legacySignedIn ? send(res, 200, { id: 1, username: 'demo' }) : send(res, 401, { detail: 'Unauthorized' });
  if (pathname === '/expenses') return send(res, 200, legacyExpenses);
  if (pathname === '/budget') return send(res, 200, { monthly_amount: budget.budget.monthlyAmount });

  if (pathname === '/api/auth/login') return send(res, 200, { user: { id: '1', username: 'demo' } }, { 'Set-Cookie': 'token=mock; Path=/; HttpOnly' });
  if (pathname.startsWith('/api/') && pathname !== '/api/auth/me' && !signedIn) return send(res, 401, { error: 'Unauthorized' });
  if (pathname === '/api/auth/me') return signedIn ? send(res, 200, { user: { id: '1', username: 'demo' } }) : send(res, 401, { error: 'Unauthorized' });
  if (pathname === '/api/summary') return send(res, 200, summary);
  if (pathname === '/api/budget') return send(res, 200, budget);
  if (pathname === '/api/categories') return send(res, 200, categories);
  if (pathname === '/api/expenses') {
    const limit = Number(searchParams.get('limit') ?? expenses.limit);
    return send(res, 200, { ...expenses, limit, items: expenses.items.slice(0, limit) });
  }
  return send(res, 404, { error: 'Not found' });
});

server.listen(Number(process.env.MOCK_PORT ?? 4100));
