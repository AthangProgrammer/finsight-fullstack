import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'finsight-'));
const good = path.join(dir, 'expenses.json');
const bad = path.join(dir, 'broken.json');
const missing = path.join(dir, 'missing.json');

fs.writeFileSync(good, JSON.stringify([{ amount: 20 }, { amount: 500 }, { amount: 150 }]));
fs.writeFileSync(bad, '{not json');

const sum = (rows) => rows.reduce((total, row) => total + row.amount, 0);

function totalWithCallback(file, callback) {
  fs.readFile(file, 'utf8', (err, text) => {
    if (err) return callback(err);
    try {
      callback(null, sum(JSON.parse(text)));
    } catch (parseError) {
      callback(parseError);
    }
  });
}

function totalWithPromise(file) {
  return fsp.readFile(file, 'utf8').then((text) => sum(JSON.parse(text)));
}

async function totalWithAsync(file) {
  const text = await fsp.readFile(file, 'utf8');
  return sum(JSON.parse(text));
}

const totalPromisified = promisify(totalWithCallback);

const callbackResult = (file) =>
  new Promise((resolve) => {
    totalWithCallback(file, (err, total) =>
      resolve(err ? `error-first callback got ${err.name}: ${err.code ?? err.message}` : `callback total = ₹${total}`),
    );
  });

const promiseResult = (file) =>
  totalWithPromise(file).then(
    (total) => `promise total = ₹${total}`,
    (err) => `.catch got ${err.name}: ${err.code ?? err.message}`,
  );

const asyncResult = async (file) => {
  try {
    return `async/await total = ₹${await totalWithAsync(file)}`;
  } catch (err) {
    return `try/catch got ${err.name}: ${err.code ?? err.message}`;
  }
};

const promisifiedResult = async (file) => {
  try {
    return `util.promisify total = ₹${await totalPromisified(file)}`;
  } catch (err) {
    return `util.promisify rejected with ${err.name}: ${err.code ?? err.message}`;
  }
};

const ticker = setInterval(() => process.stdout.write('.'), 1);

for (const [label, file] of [['good file', good], ['missing file', missing], ['invalid JSON', bad]]) {
  console.log(`\n=== ${label} ===`);
  console.log(await callbackResult(file));
  console.log(await promiseResult(file));
  console.log(await asyncResult(file));
  console.log(await promisifiedResult(file));
}

const [a, b, c] = await Promise.all([totalWithAsync(good), totalWithPromise(good), totalPromisified(good)]);
console.log('\nPromise.all (parallel):', a, b, c);

const settled = await Promise.allSettled([totalWithAsync(good), totalWithAsync(missing)]);
console.log('Promise.allSettled:', settled.map((r) => r.status));

clearInterval(ticker);
console.log('(the dots above prove the event loop kept running during the reads)');

fs.rmSync(dir, { recursive: true, force: true });
