// Prints "mid end" seconds of the given pages (all if none) — handy as snap.mjs arguments: node engine/tools/times.mjs p02 p03
import { loadEpisode } from './lib.mjs';
const { L } = loadEpisode();
const ids = process.argv.slice(2);
const out = [];
for (const p of L.pages) if (!ids.length || ids.includes(p.id)) out.push(((p.start + p.speechEnd) / 2).toFixed(1), (p.speechEnd - 0.05).toFixed(1));
console.log(out.join(' '));
