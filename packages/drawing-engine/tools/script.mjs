// Writes the timed voiceover script (out/口播脚本.md) and subtitles (out/字幕.srt) from the episode's script.js.
import fs from 'fs';
import path from 'path';
import { loadEpisode, OUT } from './lib.mjs';
const { TIMING, META, L } = loadEpisode();
const { pages, duration } = L;

const mmss = (t) => {
  t = Math.round(t * 10) / 10;
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
};
const srtTime = (t) => {
  const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};

const md = [];
md.push(`# 口播脚本 · ${META.title || ''}`, '');
md.push(`> 总时长 **${mmss(duration)}**（${pages.length} 页）。语速按约 ${TIMING.CPS} 字/秒估算，每页讲完后留 **${L.gap} 秒空档**（画面停住、无字幕），方便你停顿或临场发挥。`);
md.push('> 时间码与视频画面、字幕完全对齐；每页画面的动画按下表每句话的起点触发。', '');
md.push('## 分页总览', '', '| 页 | 时间段 | 章节 | 画面主题 |', '|---|---|---|---|');
for (const p of pages) md.push(`| ${p.index + 1} | ${mmss(p.start)} – ${mmss(p.speechEnd)} | ${p.section} | ${p.title} |`);
md.push('');
let sec = '';
for (const p of pages) {
  if (p.section !== sec) { sec = p.section; md.push(`## ${sec}`, ''); }
  md.push(`### 第 ${p.index + 1} 页 · ${p.title}　\`${mmss(p.start)} – ${mmss(p.end)}\``, '');
  md.push('| 时间 | 口播 |', '|---|---|');
  for (const c of p.cues) md.push(`| ${mmss(c.start)} – ${mmss(c.end)} | ${c.text} |`);
  if (p.index < pages.length - 1) md.push(`| ${mmss(p.speechEnd)} – ${mmss(p.end)} | *（空档 ${(p.end - p.speechEnd).toFixed(1)}s · 翻页）* |`);
  md.push('');
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '口播脚本.md'), md.join('\n'));

const srt = [];
let n = 1;
for (const p of pages) for (const c of p.cues) srt.push(`${n++}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.sub}\n`);
fs.writeFileSync(path.join(OUT, '字幕.srt'), srt.join('\n'));
console.log(`pages=${pages.length} cues=${n - 1} duration=${mmss(duration)}`);
