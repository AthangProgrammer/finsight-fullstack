import net from 'node:net';
import dns from 'node:dns/promises';

const hosts = process.argv.slice(2);
const targets = hosts.length ? hosts : ['vercel.com', 'onrender.com', 'google.com'];

const server = net.createServer((socket) => {
  console.log(`[server] client connected from ${socket.remoteAddress}:${socket.remotePort}`);
  socket.write('Welcome to the FinSight echo server\n');
  socket.on('data', (data) => {
    console.log(`[server] received ${data.length} bytes: ${JSON.stringify(data.toString().trim())}`);
    socket.write(`echo: ${data.toString().toUpperCase()}`);
  });
  socket.on('end', () => console.log('[server] client ended'));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
console.log(`[server] listening on 127.0.0.1:${port}`);

await new Promise((resolve) => {
  const client = net.connect(port, '127.0.0.1', () => {
    client.write('spent 150 on lunch\n');
  });
  let replies = 0;
  client.on('data', (data) => {
    console.log(`[client] got: ${JSON.stringify(data.toString().trim())}`);
    if (++replies === 2) client.end();
  });
  client.on('close', resolve);
});

server.close();

console.log('\n--- dns ---');
for (const host of targets) {
  try {
    const { address, family } = await dns.lookup(host);
    console.log(`${host}\n  lookup  : ${address} (IPv${family})`);
    console.log('  resolve4:', await dns.resolve4(host));
  } catch (err) {
    console.log(`${host}\n  failed  : ${err.code}`);
  }
}
console.log('\nCompare with: nslookup <host>');
console.log('Pass your deployed hostnames: node 08-net-dns.js finsight.vercel.app finsight-api.onrender.com');
