// Real page timeline (with voice.js when present): every page's start / end and when each cue starts.
// node engine/tools/pages.mjs [p03 …] [--json]
import { loadEpisode } from './lib.mjs';
const { L, SCRIPT } = loadEpisode();
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const rows = L.pages.filter((p) => !ids.length || ids.includes(p.id)).map((p) => ({
  id: p.id, start: +p.start.toFixed(2), end: +p.end.toFixed(2), speechEnd: +p.speechEnd.toFixed(2),
  cues: p.cues.map((c, i) => ({ i, at: +(c.start - p.start).toFixed(2), abs: +c.start.toFixed(2), text: c.text })),
}));
if (process.argv.includes('--json')) { console.log(JSON.stringify({ voiced: !!SCRIPT.VOICE, duration: +L.duration.toFixed(2), pages: rows }, null, 1)); process.exit(0); }
console.log(`timeline: ${SCRIPT.VOICE ? 'real voice' : 'ESTIMATE (no voice.js yet)'} · total ${L.duration.toFixed(1)}s`);
for (const p of rows) {
  console.log(`${p.id}  ${p.start}s → ${p.end}s (speech ends ${p.speechEnd}s) · page-local length ${(p.end - p.start).toFixed(2)}s`);
  for (const c of p.cues) console.log(`   c${c.i}  local ${c.at}s  abs ${c.abs}s  ${c.text}`);
}
