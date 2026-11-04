import { Readable, Transform } from 'node:stream';

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  let text = String(value ?? '');
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export const csvRows = (columns) =>
  new Transform({
    writableObjectMode: true,
    construct(callback) {
      this.push(`${columns.join(',')}\r\n`);
      callback();
    },
    transform(row, _encoding, callback) {
      callback(null, `${columns.map((column) => csvCell(row[column])).join(',')}\r\n`);
    },
  });

export function queryRows(fetchPage, cap, pageSize = 500) {
  return Readable.from(
    (async function* rows() {
      let sent = 0;
      for (let offset = 0; sent < cap; offset += pageSize) {
        const batch = await fetchPage(Math.min(pageSize, cap - sent), offset);
        yield* batch;
        sent += batch.length;
        if (batch.length < pageSize) return;
      }
    })(),
  );
}
