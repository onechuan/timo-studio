// The component library (lib/) is a set of independent files a page agent can mix freely: every name a file defines must be its
// own (no two files, and no file and the runtime, define the same P.x / PV.x), and the gallery project (test/gallery), which loads
// every file and draws every component, must build and play without a single runtime error.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { ENGINE_DIR } from '../tools/project.mjs';
import { withLinkedCopy } from './linked-copy.mjs';

const LIB = path.join(ENGINE_DIR, 'lib'), RUNTIME = path.join(ENGINE_DIR, 'runtime');
const js = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

/** names a file assigns: P.x (B.x = / Builder.prototype.x =) and PV.x (PV.x =); class methods of the runtime's Builder too */
function defined(src, classMethods = false) {
  const names = new Set();
  for (const m of src.matchAll(/^\s*(?:B|(?:PV\.)?Builder\.prototype)\.(\w+)\s*=(?!=)/gm)) names.add('P.' + m[1]);
  for (const m of src.matchAll(/^\s*PV\.(\w+)\s*=(?!=)/gm)) names.add('PV.' + m[1]);
  if (classMethods) {
    const body = /class Builder \{([\s\S]*?)\n  \}\n/.exec(src)?.[1] ?? '';
    for (const m of body.matchAll(/^ {4}(\w+)\([^)]*\)\s*\{/gm)) if (m[1] !== 'constructor') names.add('P.' + m[1]);
  }
  return names;
}

test('lib: every component name belongs to one file and never shadows the runtime', () => {
  const runtime = new Set();
  for (const f of js(RUNTIME)) for (const n of defined(fs.readFileSync(path.join(RUNTIME, f), 'utf8'), true)) runtime.add(n);
  const owner = new Map(), clashes = [];
  for (const f of js(LIB)) {
    for (const n of defined(fs.readFileSync(path.join(LIB, f), 'utf8'))) {
      if (runtime.has(n)) clashes.push(`${n} in lib/${f} shadows the runtime`);
      if (owner.has(n)) clashes.push(`${n} in lib/${f} and lib/${owner.get(n)}`);
      else owner.set(n, f);
    }
  }
  assert.deepEqual(clashes, []);
});

test('lib: the gallery covers every component file', () => {
  const script = fs.readFileSync(path.join(ENGINE_DIR, 'test/gallery/script.js'), 'utf8');
  assert.deepEqual(js(LIB).filter((f) => !script.includes(`'engine/lib/${f}'`)), []);
});

test('lib: the gallery builds and plays without runtime errors', () => {
  const lint = withLinkedCopy(path.join(ENGINE_DIR, 'test/gallery'), (dir) =>
    spawnSync(process.execPath, [path.join(ENGINE_DIR, 'tools/lint.mjs'), '--json'], { cwd: dir, encoding: 'utf8', timeout: 300000 }));
  const issues = JSON.parse(lint.stdout.trim().split('\n').pop());
  assert.deepEqual(issues.filter((i) => i.kind === 'runtime' || i.kind === 'api').map((i) => `${i.page}: ${i.msg}`), []);
});
