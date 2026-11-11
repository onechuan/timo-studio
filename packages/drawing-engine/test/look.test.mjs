import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../runtime/look.js', import.meta.url), 'utf8');
/** runs look.js the way boot.js loads it: after the style's style.js, before the runtime */
function run(look, style = { palette: { ink: '#3A2E28', red: '#C8603C', paper: '#FBF4E8' }, background: () => 'grain' }) {
  const props = {};
  const ctx = { SCRIPT: { META: look ? { look } : {} }, STYLE: style, document: { documentElement: { style: { setProperty: (k, v) => { props[k] = v; } } } } };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { style: ctx.STYLE, props };
}

test('a look\'s colours go over the style\'s, and the text colours and fonts into the CSS variables', () => {
  const { style, props } = run({ palette: { red: '#A8301F', ink: '#1A1714' }, fonts: { hand: "'Ma Shan Zheng', serif" } });
  assert.equal(style.palette.red, '#A8301F');
  assert.equal(style.palette.paper, '#FBF4E8');
  assert.equal(props['--ink'], '#1A1714');
  assert.equal(props['--hand'], "'Ma Shan Zheng', serif");
  assert.equal(style.background(), 'grain');
});

test('a new paper colour becomes the ground', () => {
  const { style } = run({ palette: { paper: '#F1EADA' } });
  assert.equal(style.background({ w: 1920, h: 1080 }), '#F1EADA');
});

test('no look changes nothing', () => {
  const { style, props } = run(undefined);
  assert.equal(style.palette.red, '#C8603C');
  assert.deepEqual(props, {});
});
