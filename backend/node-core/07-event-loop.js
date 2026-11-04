import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const order = [];
const log = (label) => order.push(label);

console.log('Predict the order of the 9 entries, then read the result.\n');

fs.readFile(fileURLToPath(import.meta.url), () => {
  log('I/O callback (fs.readFile)');
  setTimeout(() => log('setTimeout 0 inside I/O'), 0);
  setImmediate(() => log('setImmediate inside I/O'));
});

setTimeout(() => log('setTimeout 0'), 0);
setImmediate(() => log('setImmediate'));

process.nextTick(() => log('process.nextTick'));
Promise.resolve().then(() => log('promise microtask'));
queueMicrotask(() => log('queueMicrotask'));

log('synchronous code');

setTimeout(() => {
  console.log(order.join('\n'));
  console.log('\nRules:');
  console.log('  CommonJS: sync → nextTick → microtasks → timers → I/O poll → setImmediate');
  console.log('  ES modules (this file): the module itself runs inside a microtask, so promise microtasks run before nextTick');
  console.log('  inside an I/O callback, setImmediate always runs before setTimeout 0');
  console.log('  at top level, setTimeout 0 vs setImmediate depends on process speed (usually timeout first)');
}, 100);
