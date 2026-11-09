// Register component files in script.js META.extras safely while several page sessions run in parallel.
// node engine/tools/use-extra.mjs extras/foo.js [lib-name.js …]   (a bare lib name copies engine/lib/<name> into extras/ first)
import fs from 'fs';
import path from 'path';
import { KIT, EP } from './lib.mjs';
const lock = path.join(EP, '.script.lock');
for (let i = 0; ; i++) { try { fs.mkdirSync(lock); break; } catch { if (i > 200) { console.error('lock busy'); process.exit(1); } await new Promise((r) => setTimeout(r, 50)); } }
try {
  const files = process.argv.slice(2).map((f) => {
    if (f.includes('/')) return f;
    const src = path.join(KIT, 'lib', f);
    if (!fs.existsSync(src)) throw new Error(`engine/lib/${f} not found`);
    fs.mkdirSync(path.join(EP, 'extras'), { recursive: true });
    if (!fs.existsSync(path.join(EP, 'extras', f))) fs.copyFileSync(src, path.join(EP, 'extras', f));
    return `extras/${f}`;
  });
  const p = path.join(EP, 'script.js');
  let s = fs.readFileSync(p, 'utf8');
  const m = s.match(/extras:\s*\[([^\]]*)\]/);
  if (!m) throw new Error('META.extras not found in script.js');
  const cur = [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => x[1] || x[2]);
  const next = [...cur, ...files.filter((f) => !cur.includes(f))];
  s = s.replace(m[0], `extras: [${next.map((f) => `'${f}'`).join(', ')}]`);
  fs.writeFileSync(p, s);
  console.log('META.extras =', next.join(', '));
} finally { fs.rmdirSync(lock); }
