import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const THRESHOLD = Number(process.env.DIFF_THRESHOLD ?? 0.06);
const read = (path) => PNG.sync.read(readFileSync(path));

mkdirSync('e2e/diff', { recursive: true });

let failed = 0;
for (const file of readdirSync('e2e/baseline').filter((name) => name.endsWith('.png'))) {
  if (!existsSync(`e2e/current/${file}`)) {
    console.log(`${file}: missing in current`);
    failed += 1;
    continue;
  }
  const a = read(`e2e/baseline/${file}`);
  const b = read(`e2e/current/${file}`);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const crop = (image) => {
    const out = new PNG({ width, height });
    PNG.bitblt(image, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const diff = new PNG({ width, height });
  const changed = pixelmatch(crop(a).data, crop(b).data, diff.data, width, height, { threshold: 0.1 });
  writeFileSync(`e2e/diff/${file}`, PNG.sync.write(diff));
  const ratio = changed / (width * height);
  const heightNote = a.height === b.height ? '' : ` (height ${a.height} vs ${b.height})`;
  const ok = ratio <= THRESHOLD;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${file}: ${(ratio * 100).toFixed(2)}% pixels differ${heightNote}`);
}
process.exit(failed ? 1 : 0);
