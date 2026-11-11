// A page's check in one browser: the layout lint (checks.mjs) and a contact sheet of the page at the given moments. The
// studio runs this after every draft and fix: the lint and the sheet used to be two tools, two Chromes and two loads
// of the film per check.
// node engine/tools/check.mjs --only p03 --sheet p03-r1 [--determinism] [--lint-ms 90000] 24.1 26.0 29.4 …
// → one JSON line: { issues, sheet } (sheet: project-relative jpg), or { issues, crash } when the page throws or will
//   not draw. `--lint-ms`: a lint that takes longer is given up (issues: []); the sheet is still taken.
import path from 'path';
import { openStage, loadEpisode, closeStage, within, finish, OUT, EP } from './lib.mjs';
import { lintPages, contactSheet } from './checks.mjs';
const args = process.argv.slice(2);
const take = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const flag = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? (args.splice(i, 1), true) : false; };
const only = take('only'), name = take('sheet'), lintMs = +(take('lint-ms') ?? 90_000), determinism = flag('determinism');
const times = args.filter((a) => a !== '--portrait').map(Number);
if (!only || !name || !times.length || times.some((t) => !Number.isFinite(t))) { console.error('usage: check.mjs --only pNN --sheet name [--determinism] [--lint-ms N] t1 t2 …'); process.exit(1); }

const { L, META } = loadEpisode();
L.meta = META;
const pages = L.pages.filter((p) => only.split(',').includes(p.id));
const query = 'render&only=' + only;
const out = { issues: [] };
let stage;
try {
  stage = await openStage(query);
  try { out.issues = await within(lintPages(stage.page, { L, pages, determinism }), lintMs, 'lint took too long'); }
  catch (e) {
    if (!e.stalled) throw e;
    // a stalled lint may have left the browser stuck: the sheet gets a fresh one
    await closeStage(stage.browser);
    stage = await openStage(query);
  }
  const file = await contactSheet(stage.page, times, path.join(OUT, 'snap', name + '.jpg'), { tile: +process.env.SNAP_TILE || 480 });
  out.sheet = path.relative(EP, file);
} catch (e) {
  out.crash = String(e?.stack || e);
}
console.log(JSON.stringify(out));

finish();
