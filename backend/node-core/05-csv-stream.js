import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const source = path.join(dataDir, 'big-expenses.csv');
const target = path.join(dataDir, 'big-expenses-filtered.csv');
const ROWS = 100_000;
const categories = ['Food', 'Transport', 'Rent', 'Shopping', 'Bills', 'Health', 'Other'];

function* generateRows() {
  yield 'id,description,amount,category\n';
  for (let i = 1; i <= ROWS; i++) {
    const amount = ((i * 7919) % 5000) + 1;
    yield `${i},Expense ${i},${amount},${categories[i % categories.length]}\n`;
  }
}

class CsvToObjects extends Transform {
  #rest = '';
  #header = null;

  constructor() {
    super({ readableObjectMode: true });
  }

  #emitLine(line) {
    if (!line) return;
    const cells = line.split(',');
    if (!this.#header) {
      this.#header = cells;
      return;
    }
    this.push(Object.fromEntries(this.#header.map((name, i) => [name, cells[i]])));
  }

  _transform(chunk, _encoding, done) {
    const lines = (this.#rest + chunk.toString('utf8')).split('\n');
    this.#rest = lines.pop();
    lines.forEach((line) => this.#emitLine(line));
    done();
  }

  _flush(done) {
    this.#emitLine(this.#rest);
    done();
  }
}

class FilterByAmount extends Transform {
  constructor(minimum) {
    super({ objectMode: true });
    this.minimum = minimum;
  }

  _transform(row, _encoding, done) {
    done(null, Number(row.amount) >= this.minimum ? row : undefined);
  }
}

class ObjectsToCsv extends Transform {
  #wroteHeader = false;

  constructor() {
    super({ writableObjectMode: true });
  }

  _transform(row, _encoding, done) {
    let out = '';
    if (!this.#wroteHeader) {
      out += Object.keys(row).join(',') + '\n';
      this.#wroteHeader = true;
    }
    done(null, out + Object.values(row).join(',') + '\n');
  }
}

let peakHeap = 0;
const sampler = setInterval(() => {
  peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);
}, 20);

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';

await fs.mkdir(dataDir, { recursive: true });

await pipeline(Readable.from(generateRows()), createWriteStream(source));
const sourceSize = (await fs.stat(source)).size;
console.log(`generated ${ROWS} rows → ${mb(sourceSize)}`);

let kept = 0;
const counter = new Transform({
  objectMode: true,
  transform(row, _encoding, done) {
    kept++;
    done(null, row);
  },
});

await pipeline(
  createReadStream(source, { highWaterMark: 64 * 1024 }),
  new CsvToObjects(),
  new FilterByAmount(4000),
  counter,
  new ObjectsToCsv(),
  createWriteStream(target),
);

clearInterval(sampler);
console.log(`kept ${kept} rows with amount >= 4000 → ${mb((await fs.stat(target)).size)}`);
console.log(`peak heap used: ${mb(peakHeap)} (file size ${mb(sourceSize)}, memory stays flat)`);

await fs.rm(dataDir, { recursive: true, force: true });
