// Node-only data loader (scripts/SSR). Reads the JSON read-models from disk.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(DIR, '..', '..', 'data', 'ps');
export function loadData() {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  return { stars: read('stars.json'), narratives: read('narratives.json'), fate: read('fate.json'),
    auspiciousness: read('auspiciousness.json'), lunarTable: read('lunar-table.json') };
}
