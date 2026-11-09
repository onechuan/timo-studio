// Style benchmarks are regression tests: every style's example project must stay clean under lint and storyboard-lint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { ENGINE_DIR } from '../tools/project.mjs';
import { withLinkedCopy } from './linked-copy.mjs';

for (const style of fs.readdirSync(path.join(ENGINE_DIR, 'styles'))) {
  const dir = path.join(ENGINE_DIR, 'styles', style, 'example');
  if (!fs.existsSync(path.join(dir, 'script.js'))) continue;
  test(`${style} benchmark: storyboard and layout are clean`, () => withLinkedCopy(dir, (dir) => {
    const sb = spawnSync(process.execPath, [path.join(ENGINE_DIR, 'tools/storyboard-lint.mjs'), 'storyboard.json', '--source', 'materials', '--json'], { cwd: dir, encoding: 'utf8' });
    assert.deepEqual(JSON.parse(sb.stdout).filter((i) => i.level === 'red'), []);
    const lint = spawnSync(process.execPath, [path.join(ENGINE_DIR, 'tools/lint.mjs'), '--json', '--determinism'], { cwd: dir, encoding: 'utf8', timeout: 180000 });
    assert.deepEqual(JSON.parse(lint.stdout.trim().split('\n').pop()), []);
  }));
}
