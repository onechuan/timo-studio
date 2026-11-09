// Publishing kit → out/发布信息.md: per-platform titles, description, tags, and timestamped chapters.
// Chapters come from script.js: consecutive pages with the same `section` form one chapter, starting when its first page starts
// (so timestamps always match the video). Titles/description/tags come from META.publish. Run from a project dir.
import fs from 'fs';
import path from 'path';
import { loadEpisode, OUT } from './lib.mjs';
const { META, L } = loadEpisode();
const pub = META.publish;
if (!pub) { console.error('META in script.js has no publish block yet (titles / description / tags); write it first.'); process.exit(1); }

const ts = (t) => {
  t = Math.floor(t);
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60, p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
};
const chapters = [];
for (const p of L.pages) {
  const last = chapters[chapters.length - 1];
  if (!last || last.section !== p.section) chapters.push({ section: p.section, start: chapters.length ? p.start : 0 });
}
const chapterLines = chapters.map((c) => `${ts(c.start)} ${c.section}`);

// platform limits (characters): title / description
const PLATFORMS = [
  ['bilibili', 'B 站', 80, 2000],
  ['youtube', 'YouTube', 100, 5000],
  ['douyin', '抖音', 30, 1000],
  ['shipinhao', '视频号（短标题）', 16, 1000],
  ['xiaohongshu', '小红书', 20, 1000],
].filter(([k]) => !pub.platforms || pub.platforms.includes(k));   // META.publish.platforms: when publishing to only some platforms, check only those
const len = (s) => [...s].length;
const warn = [];
const md = [`# 发布信息 · ${META.title || ''}`, '', `> 时长 **${ts(L.duration)}**。章节时间码由 script.js 自动算出，和视频完全对齐；改了口播要重新运行 \`npm run publish\`。`, ''];
md.push('## 标题', '', '| 平台 | 标题 | 字数 / 上限 |', '|---|---|---|');
for (const [k, name, max] of PLATFORMS) {
  const t = (pub.titles || {})[k];
  if (!t) { warn.push(`缺少 ${name} 标题（publish.titles.${k}）`); continue; }
  if (len(t) > max) warn.push(`${name} 标题 ${len(t)} 字，超过上限 ${max}`);
  md.push(`| ${name} | ${t.replace(/\|/g, "\\|")} | ${len(t)} / ${max} |`);
}
const desc = [pub.description.trim(), '', '📌 章节', ...chapterLines].join('\n');
for (const [, name, , max] of PLATFORMS) if (len(desc) > max) warn.push(`简介（含章节）${len(desc)} 字，超过 ${name} 上限 ${max}`);
md.push('', '## 简介（含章节，可直接粘贴）', '', '```', desc, '```', '');
md.push('## 分段章节', '', '> B 站「分段章节」、YouTube 章节（第一条必须是 00:00、至少 3 段、每段 ≥ 10 秒）都用这份。', '', '```', ...chapterLines, '```', '');
const short = chapters.map((c, i) => [c, (chapters[i + 1]?.start ?? L.duration) - c.start]).filter(([, d]) => d < 10);
const ytChapters = !pub.platforms || pub.platforms.includes('youtube');   // not publishing to YouTube: skip its chapter rules
if (ytChapters && chapters.length < 3) warn.push('章节少于 3 段，YouTube 不会识别');
if (ytChapters) for (const [c] of short) warn.push(`章节「${c.section}」不到 10 秒，YouTube 不会识别`);
md.push('| 时间段 | 小标题 | 时长 |', '|---|---|---|');
chapters.forEach((c, i) => { const e = chapters[i + 1]?.start ?? L.duration; md.push(`| ${ts(c.start)} – ${ts(e)} | ${c.section} | ${ts(e - c.start)} |`); });
if (pub.tags?.length) md.push('', '## 标签', '', pub.tags.map((t) => '#' + t).join(' '));
// META.publish.captions: { douyin, xiaohongshu, … } a ready-to-paste caption per platform, checked against its length limit
if (pub.captions) {
  md.push('', '## 各平台文案（直接复制）');
  for (const [k, name, , max] of PLATFORMS) {
    const c = pub.captions[k];
    if (!c) continue;
    if (len(c.trim()) > max) warn.push(`${name} 文案 ${len(c.trim())} 字，超过上限 ${max}`);
    md.push('', `### ${name}`, '', '```', c.trim(), '```');
  }
}
if (pub.cover) md.push('', '## 封面大字', '', pub.cover);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '发布信息.md'), md.join('\n') + '\n');
console.log(`chapters=${chapters.length} → out/发布信息.md`);
if (warn.length) { console.error('⚠ ' + warn.join('\n⚠ ')); process.exitCode = 1; }
