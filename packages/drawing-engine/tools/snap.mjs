// Stills for checking a page. Usage (from a project dir): node engine/tools/snap.mjs [--only p01,p02] [--subs] [--sheet name] 1.5 4 6.4 ...
//   add --portrait for the portrait canvas (pages-portrait/)
// → out/snap/snap-<t>.png, or with --sheet one contact sheet out/snap/<name>.jpg (3 per row, each frame labelled with its time;
//   SNAP_LABEL=0 leaves the labels off, for a thumbnail)
import fs from 'fs';
import path from 'path';
import { openStage, OUT, finish } from './lib.mjs';
import { contactSheet } from './checks.mjs';
const args = process.argv.slice(2).filter((a) => a !== '--portrait');
const oi = args.indexOf('--only');
const only = oi >= 0 ? args.splice(oi, 2)[1] : null;
const si = args.indexOf('--subs');
const subs = si >= 0 ? (args.splice(si, 1), true) : false;
const hi = args.indexOf('--sheet');
const sheet = hi >= 0 ? args.splice(hi, 2)[1] : null;
const bad = args.filter((a) => !Number.isFinite(Number(a)));
if (bad.length || !args.length) { console.error(`bad time arguments: ${bad.join(' ') || '(no times given)'}`); process.exit(1); }
const dir = path.join(OUT, 'snap');
fs.mkdirSync(dir, { recursive: true });
const { browser, page, duration } = await openStage('render' + (only ? '&only=' + only : '') + (subs ? '&subs' : ''));
console.log('duration', duration.toFixed(1));
if (sheet) {
  console.log(await contactSheet(page, args.map(Number), path.join(dir, sheet + '.jpg'), { tile: +process.env.SNAP_TILE || 640, label: process.env.SNAP_LABEL !== '0' }));
} else {
  for (const t of args.map(Number)) {
    await page.evaluate(async (x) => { ENGINE.renderAt(x); if (window.__frameReady) await window.__frameReady(x); }, t);
    const f = path.join(dir, `snap-${t}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
}

finish();
