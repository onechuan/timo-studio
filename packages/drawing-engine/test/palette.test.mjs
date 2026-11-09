import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createProject } from '../tools/project.mjs';
import { findChrome } from '../tools/bins.mjs';

const src = fs.readFileSync(new URL('../runtime/core.js', import.meta.url), 'utf8');
/** the runtime's core as a page loads it, after a style whose palette has no yellowF; CSS.supports as a browser's */
function core() {
  const ctx = { STYLE: { palette: { ink: '#3A2E28', yellow: '#E0B040', paper: '#FFFFFF' } }, rough: { generator: () => ({}) }, CSS: { supports: (_p, v) => ['white', 'transparent', 'currentColor'].includes(v) } };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.PV;
}

test('a colour name the palette lacks never passes on as CSS: a light fill of a colour it has is mixed toward the paper quietly, anything else is ink and the page is noted', () => {
  const PV = core();
  PV.colorPage = 'p05';
  assert.equal(PV.col('yellow'), '#E0B040');
  assert.equal(PV.col('yellowF'), '#f8eed5', 'yellow mixed toward the paper as the fills are');
  assert.equal(PV.col('desk'), '#3A2E28');
  assert.equal(PV.col('tealF'), '#3A2E28', 'a fill of a colour the palette lacks too is ink');
  for (const ok of ['#123456', 'rgb(1, 2, 3)', 'none', 'white', 'transparent', 'url(#g1)']) assert.equal(PV.col(ok), ok);
  assert.equal(PV.col(undefined), undefined);
  assert.deepEqual([...PV.unknownColors.get('p05')], ['desk', 'tealF'], 'the mixed fill is not reported: the engine\'s own helpers compose it');
  PV.colorPage = undefined;
  PV.col('other');
  assert.equal(PV.unknownColors.size, 1, 'outside a page nothing is noted');
});

const chrome = findChrome();
test('the page check reports a colour name the style lacks as an error, with the style\'s names, and not a fill the engine composes', { skip: !chrome && 'no Chrome' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-palette-'));
  try {
    createProject(path.join(dir, 'film'), { title: 'Palette', style: 'warm-story' });
    const film = path.join(dir, 'film');
    fs.writeFileSync(path.join(film, 'pages', 'p01.js'), "ENGINE.visual('p01', (P) => {\n  P.chip(200, 200, 240, 'yellow chip', { color: 'yellow' });\n  P.box(400, 300, 600, 300, { fill: 'yellowF', color: 'ink' });\n  P.box(400, 650, 300, 200, { fill: 'pinkk', color: 'ink' });\n  P.text('hi', { x: 500, y: 900, color: 'green' });\n});\n");
    const out = execFileSync(process.execPath, ['engine/tools/lint.mjs', '--json'], { cwd: film, encoding: 'utf8', env: { ...process.env, CHROME_PATH: chrome } });
    const issues = JSON.parse(out.trim().split('\n').at(-1));
    const bad = issues.filter((i) => i.kind === 'palette');
    assert.equal(bad.length, 1);
    assert.equal(bad[0].page, 'p01');
    assert.equal(bad[0].level, 'error');
    assert.equal(bad[0].data.name, 'pinkk');
    assert.match(bad[0].msg, /unknown colour name "pinkk": this style's palette has ink, .*paper/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
