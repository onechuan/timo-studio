import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../lib/warm.js', import.meta.url), 'utf8');
/** warm.js over a stand-in runtime: elements keep their attributes, a page keeps its ticks */
function page() {
  const el = () => ({ attrs: {}, style: {}, setAttribute(k, v) { this.attrs[k] = v; }, insertBefore() {}, getTotalLength: () => 100, getPointAtLength: () => ({ x: 0, y: 0 }) });
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  class Builder { constructor() { this.svg = el(); this.ticks = []; } tick(fn) { this.ticks.push(fn); } }
  const PV = { s: (_tag, attrs) => { const e = el(); Object.assign(e.attrs, attrs); return e; }, col: () => '#808080', clamp, lerp: (a, b, k) => a + (b - a) * k, ease: { out: (x) => 1 - Math.pow(1 - x, 3) }, Builder };
  const ctx = { PV };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const P = new Builder();
  return { P, at: (lt) => { for (const fn of P.ticks) fn(lt); } };
}

test('every warm-story object can be hidden like any other element, and fades out from then', () => {
  const { P, at } = page();
  const tag = P.tag(400, 300, '30 年', { at: 0 });
  const hand = P.hand(600, 400, 160, { at: 0 });
  const cal = P.calendar(800, 400, 220, { at: 0, out: 5 });
  assert.equal(tag.hide(2, 0.4), tag, 'hide returns the handle, so it chains');
  hand.hide(3);
  at(1);
  assert.equal(+tag.g.attrs.opacity, 1);
  at(2.4);
  assert.equal(+tag.g.attrs.opacity, 0);
  assert.equal(+hand.g.attrs.opacity, 1);
  at(3.6);
  assert.equal(+hand.g.attrs.opacity, 0);
  assert.equal(+cal.g.attrs.opacity, 1, 'o.out still works as before');
  at(5.6);
  assert.equal(+cal.g.attrs.opacity, 0);
});
