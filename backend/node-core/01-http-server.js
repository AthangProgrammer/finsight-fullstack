import http from 'node:http';

const expenses = [
  { id: 1, description: 'Chai', amount: 20, category: 'Food' },
  { id: 2, description: 'Metro card', amount: 500, category: 'Transport' },
];
let nextId = 3;

const send = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;
  console.log(req.method, pathname, Object.fromEntries(searchParams));

  if (req.method === 'GET' && pathname === '/healthz') {
    return send(res, 200, { status: 'ok', uptime: process.uptime() });
  }

  if (req.method === 'GET' && pathname === '/expenses') {
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const items = expenses.filter((e) => e.description.toLowerCase().includes(q));
    return send(res, 200, { items, total: items.length });
  }

  const match = pathname.match(/^\/expenses\/(\d+)$/);
  if (req.method === 'GET' && match) {
    const found = expenses.find((e) => e.id === Number(match[1]));
    return found ? send(res, 200, found) : send(res, 404, { error: 'Not found' });
  }

  if (req.method === 'POST' && pathname === '/expenses') {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      return send(res, 400, { error: 'Body must be valid JSON' });
    }
    if (typeof data.description !== 'string' || !(Number(data.amount) > 0)) {
      return send(res, 400, { error: 'description and a positive amount are required' });
    }
    const created = {
      id: nextId++,
      description: data.description,
      amount: Number(data.amount),
      category: data.category ?? 'Other',
    };
    expenses.push(created);
    return send(res, 201, created);
  }

  if (pathname === '/healthz' || pathname.startsWith('/expenses')) {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Method not allowed' });
  }

  return send(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT ?? 4100);
server.listen(port, () => {
  console.log(`Plain node:http server on http://localhost:${port}`);
  console.log('Try:');
  console.log(`  curl -i http://localhost:${port}/healthz`);
  console.log(`  curl -i "http://localhost:${port}/expenses?q=chai"`);
  console.log(`  curl -i http://localhost:${port}/expenses/99`);
  console.log(
    `  curl -i -X POST -H "Content-Type: application/json" -d '{"description":"Lunch","amount":150}' http://localhost:${port}/expenses`,
  );
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
