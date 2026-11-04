import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, 'data');

console.log('--- path ---');
console.log('join   :', path.join('data', '..', 'data', 'expenses.csv'));
console.log('resolve:', path.resolve('data', 'expenses.csv'));
console.log('join vs resolve with absolute segment:');
console.log('  join   :', path.join('data', '/expenses.csv'));
console.log('  resolve:', path.resolve('data', '/expenses.csv'));
console.log('parse  :', path.parse(path.join(dataDir, 'expenses.csv')));
console.log('extname:', path.extname('report.final.pdf'));
console.log('basename:', path.basename('/a/b/expenses.csv', '.csv'));
console.log('sep    :', JSON.stringify(path.sep));

console.log('--- fs/promises ---');
await fs.mkdir(dataDir, { recursive: true });

const file = path.join(dataDir, 'expenses.csv');
await fs.writeFile(file, 'id,description,amount\n1,Chai,20\n2,Metro,500\n');
await fs.appendFile(file, '3,Lunch,150\n');

const text = await fs.readFile(file, 'utf8');
console.log('read:\n' + text);

const info = await fs.stat(file);
console.log('stat:', { size: info.size, isFile: info.isFile(), isDirectory: info.isDirectory() });

await fs.copyFile(file, path.join(dataDir, 'backup.csv'));
console.log('readdir:', await fs.readdir(dataDir));

try {
  await fs.readFile(path.join(dataDir, 'missing.csv'));
} catch (err) {
  console.log('missing file error code:', err.code);
}

await fs.rm(dataDir, { recursive: true, force: true });
console.log('cleaned up, data/ exists:', await fs.access(dataDir).then(() => true, () => false));
