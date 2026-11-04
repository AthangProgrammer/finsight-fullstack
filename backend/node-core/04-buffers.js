const text = 'Rent ₹12000';

const buf = Buffer.from(text, 'utf8');
console.log('buffer       :', buf);
console.log('string length:', text.length);
console.log('byte length  :', Buffer.byteLength(text), '(buf.length =', buf.length + ')');

const rupee = Buffer.from('₹');
console.log('₹ bytes      :', rupee, '→', rupee.length, 'bytes');

const hex = buf.toString('hex');
const b64 = buf.toString('base64');
console.log('hex          :', hex);
console.log('base64       :', b64);
console.log('hex round    :', Buffer.from(hex, 'hex').toString('utf8'));
console.log('base64 round :', Buffer.from(b64, 'base64').toString('utf8'));

const joined = Buffer.concat([Buffer.from('Total: '), Buffer.from('₹'), Buffer.from('500')]);
console.log('concat       :', joined.toString());

const alloc = Buffer.alloc(8);
alloc.writeUInt32BE(50000, 0);
alloc.writeUInt32BE(42, 4);
console.log('alloc/write  :', alloc, alloc.readUInt32BE(0), alloc.readUInt32BE(4));

const slice = buf.subarray(0, 4);
slice[0] = 0x72;
console.log('subarray shares memory:', buf.toString());

console.log('equals       :', Buffer.from('a').equals(Buffer.from('a')));
console.log('toJSON       :', JSON.stringify(Buffer.from('hi')));
