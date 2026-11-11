import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { FFMPEG } from '../tools/bins.mjs';
import { measure } from '../tools/film-gate.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'film-gate-'));
const make = (name, filter) => {
  const out = path.join(dir, name);
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', ...filter, out]);
  assert.equal(r.status, 0, String(r.stderr));
  return out;
};
const busy = (d) => ['-f', 'lavfi', '-i', `testsrc2=size=640x360:rate=30:duration=${d}`];

test('a blank stretch in the middle of the film is red, with its time code', () => {
  const f = make('blank.mp4', [...busy(2), '-f', 'lavfi', '-i', 'color=c=0xF4E7D3:size=640x360:rate=30:duration=1.5', ...busy(2),
    '-filter_complex', '[0][1][2]concat=n=3:v=1[v]', '-map', '[v]']);
  const res = measure(f);
  assert.equal(res.red, true);
  const run = res.gates.find((g) => g.key === 'blank').value[0];
  assert.ok(run.at >= 1.8 && run.at <= 2.3 && run.seconds >= 1.2, JSON.stringify(run));
});

test('a film with content throughout passes', () => {
  assert.equal(measure(make('busy.mp4', busy(5))).red, false);
});

test('blank frames at the very start and end are not counted', () => {
  const f = make('edges.mp4', ['-f', 'lavfi', '-i', 'color=c=white:size=640x360:rate=30:duration=0.4', ...busy(3),
    '-filter_complex', '[0][1]concat=n=2:v=1[v]', '-map', '[v]']);
  assert.equal(measure(f).red, false);
});

test('the agent\'s sound files are decoded with local files only (render.mjs, mix.mjs)', () => {
  const src = (f) => fs.readFileSync(new URL(`../tools/${f}`, import.meta.url), 'utf8');
  // a "sound" in audio/ that is really a playlist of web addresses must fetch nothing, whatever ffmpeg's defaults
  assert.match(src('render.mjs'), /'-protocol_whitelist', 'file,pipe', '-i', path\.join\(EP, c\.audio\)/);
  assert.match(src('mix.mjs'), /'-protocol_whitelist', 'file,pipe', '-i', f\b/);
});
