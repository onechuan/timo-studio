// Layout pre-check (no model, no screenshots): samples each page every 0.5s and reports visible text that runs off the
// canvas / safe area, sits in the subtitle band, overlaps other text, or renders too small to read. Per page it also checks
// the settled state (body fills the content area, text doesn't dominate) and, with --determinism, that a frame renders
// identically whether reached from the start or from elsewhere on the timeline. The checks themselves are in checks.mjs.
// node engine/tools/lint.mjs [--only p01,p02] [--step 0.5] [--min-font 24] [--determinism] [--json]  → prints issues; exit 0.
import { openStage, loadEpisode, finish } from './lib.mjs';
import { lintPages, printIssues } from './checks.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const only = arg('only', null), asJson = process.argv.includes('--json');
const { L, META } = loadEpisode();
L.meta = META;
const pages = L.pages.filter((p) => !only || only.split(',').includes(p.id));
const { browser, page } = await openStage('render' + (only ? '&only=' + only : ''));
const issues = await lintPages(page, { L, pages, step: +arg('step', 0.5), minFont: +arg('min-font', 24), determinism: process.argv.includes('--determinism') });
if (asJson) console.log(JSON.stringify(issues));
else printIssues(issues);

finish();
