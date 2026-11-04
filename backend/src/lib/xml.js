const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const INVALID_XML_CHARS = /[^\u0009\u000A\u000D -퟿-�]/gu;

export const xmlEscape = (value) =>
  String(value ?? '')
    .replace(INVALID_XML_CHARS, '')
    .replace(/[&<>"']/g, (char) => ESCAPES[char]);

export function expensesXml(rows) {
  const items = rows
    .map(
      (row) =>
        `  <expense id="${xmlEscape(row.id)}">\n` +
        `    <description>${xmlEscape(row.description)}</description>\n` +
        `    <category>${xmlEscape(row.category)}</category>\n` +
        `    <amount>${xmlEscape(row.amount)}</amount>\n` +
        `    <date>${xmlEscape(row.date)}</date>\n` +
        '  </expense>',
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<expenses count="${rows.length}">\n${items}\n</expenses>\n`;
}
