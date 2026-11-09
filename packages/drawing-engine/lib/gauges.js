/* Gauges: an upright tank that fills and spills (tank), a semicircle meter (gauge), nodes on a ring with a travelling dot (loopRing)
 * and a rubber stamp on a paper backing (stampF). All pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;

  /**
   * tank(x, y, w, h, segs, o) — a capacity (a budget, a window, a quota) drawn as an upright tank that fills from the bottom.
   * segs(lt) → [{ v, color }] (units); o: { cap (units that fit), at, fmt(total, lt) → str, labelY }
   * Anything past cap spills out of the top and the outline turns red.
   */
  B.tank = function (x, y, w, hh, segs, o = {}) {
    const cap = o.cap ?? 100, sc = hh / cap, at = o.at ?? 0;
    const total = (lt) => segs(lt).reduce((a, s) => a + Math.max(0, s.v), 0);
    this.liveRough((lt, R) => {
      if (lt < at) return null;
      const k = ease.out(clamp((lt - at) / 0.5)), over = total(lt) > cap + 0.01;
      const out = [R.box(x, y + hh * (1 - k), w, hh * k, { r: 14, color: over ? 'red' : 'soft', sw: over ? 3.6 : 2.6, seed: 3 })];
      if (k < 1) return out;
      let yy = y + hh;
      segs(lt).forEach((s, i) => {
        const bh = Math.max(0, s.v) * sc;
        if (bh < 1.5) return;
        const top = yy - bh;
        const spill = top < y - 2;
        out.push(R.box(x + 8, top + 2, w - 16, bh - 4, { r: 8, fill: (spill ? 'red' : s.color) + 'F', color: spill ? 'red' : s.color, sw: 2, seed: 40 + i }));
        yy = top;
      });
      return out;
    });
    if (o.fmt) this.follow((lt) => (lt < at + 0.3 ? null : { text: o.fmt(total(lt), lt), x: x + w / 2, y: o.labelY ?? y + hh + 16, color: total(lt) > cap + 0.01 ? 'red' : undefined }),
      { size: o.size ?? 32, font: 'latin', weight: 700, color: o.color || 'soft', w: Math.max(w + 120, 260) });
    return { total };
  };

  /**
   * gauge(cx, cy, r, value, o) — semicircle meter. value(lt) → 0..1 (0 = left, 1 = right).
   * o: { at, zones: [[v0, v1, color]], ticks: [[v, text]], label(lt) → str, labelColor(lt) → color }
   */
  B.gauge = function (cx, cy, r, value, o = {}) {
    const at = o.at ?? 0;
    const pt = (v, rr) => { const a = Math.PI * (1 - v); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; };
    const arc = (v0, v1, rr) => { const [x0, y0] = pt(v0, rr), [x1, y1] = pt(v1, rr); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${rr} ${rr} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
    (o.zones || [[0, 1, 'soft']]).forEach(([v0, v1, c], i) => this.path(arc(v0, v1, r), { color: c, sw: 16, rough: 0.4, single: true, at: at + i * 0.15, dur: 0.5 }));
    this.path(arc(0, 1, r + 18), { color: 'faint', sw: 2, single: true, at, dur: 0.6 });
    for (const [v, t] of o.ticks || []) {
      const [tx, ty] = pt(v, r + 50);
      this.text(t, { x: tx, y: ty - 20, w: 140, align: 'c', size: 26, font: 'latin', color: 'muted', at: at + 0.4, mode: 'fade' });
    }
    this.liveRough((lt, R) => {
      if (lt < at + 0.4) return null;
      const [nx, ny] = pt(clamp(value(lt)), r * 0.82);
      return [R.line(cx, cy, nx, ny, { color: 'ink', sw: 5, rough: 0.3, seed: 9 }), R.circle(cx, cy, 30, { fill: 'ink', color: 'ink', sw: 2, seed: 10 })];
    });
    if (o.label) this.follow((lt) => (lt < at + 0.4 ? null : { text: o.label(lt), x: cx, y: cy + 26, color: o.labelColor ? o.labelColor(lt) : undefined }),
      { size: o.size ?? 52, font: 'latin', weight: 700, color: 'ink', w: 2 * r });
    return { pt };
  };

  /**
   * loopRing(cx, cy, r, labels, o) — three nodes on a circle (top, bottom-right, bottom-left), clockwise arrows between them,
   * and a dot that travels the circle. o: { at, colors, pos(lt) → turns (0 = top node, 1/3 = next …) | null, nodeD, size }
   */
  B.loopRing = function (cx, cy, r, labels, o = {}) {
    const at = o.at ?? 0, colors = o.colors || ['blue', 'orange', 'green'], nd = o.nodeD ?? 150;
    const P = (turn, rr = r) => { const a = -Math.PI / 2 + turn * Math.PI * 2; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    const n = labels.length, gapT = (nd / 2 + 16) / (2 * Math.PI * r);
    labels.forEach((_, i) => {
      const t0 = i / n + gapT, t1 = (i + 1) / n - gapT;
      const [x0, y0] = P(t0), [x1, y1] = P(t1);
      this.arrow(0, 0, 0, 0, { d: `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`, color: 'soft', sw: 3, at: at + 0.3 + i * 0.25, dur: 0.5 });
    });
    const nodes = labels.map((l, i) => {
      const [x, y] = P(i / n);
      this.circle(x, y, nd, { fill: colors[i] + 'F', color: colors[i], sw: 3, at: at + i * 0.25, dur: 0.5 });
      this.text(l, { x, y: y - (o.size ?? 44) * 0.72, w: nd, align: 'c', size: o.size ?? 44, weight: 700, color: colors[i], at: at + 0.2 + i * 0.25, mode: 'fade' });
      return { x, y };
    });
    if (o.pos) this.liveRough((lt, R) => {
      const p = o.pos(lt);
      if (p == null) return null;
      const out = [];
      const [x, y] = P(p);
      // light up the node the dot is sitting on
      const k = ((p % 1) + 1) % 1, i = Math.round(k * n) % n, d = Math.abs(k * n - Math.round(k * n));
      if (d < 0.18) out.push(R.circle(nodes[i].x, nodes[i].y, nd + 30, { color: colors[i], sw: 4, seed: 60 + i, rough: 0.6 }));
      out.push(R.circle(x, y, 38, { fill: 'yellow', color: 'orange', sw: 2.6, seed: 71 }));
      return out;
    });
    return { nodes, P };
  };
  /** Rubber stamp with a paper backing, so it stays legible over busy drawings. Same options as P.stamp. */
  B.stampF = function (x, y, str, o = {}) {
    const at = o.at ?? 0, c = o.color || 'red', w = o.w ?? 200, hh = o.h ?? 76;
    const L = this.layer();
    L.box(x - w / 2, y - hh / 2, w, hh, { r: 10, fill: o.fill || 'paper', color: c, sw: 3.4, at, dur: 0.3, rough: 1.4, texture: false });
    L.text(str, { x, y: y - (o.size ?? 38) * 0.72, w, align: 'c', size: o.size ?? 38, weight: 700, color: c, at, mode: 'fade', dur: 0.2 });
    this.tick((lt) => {
      const k = clamp((lt - at) / 0.35);
      L.wrap.style.opacity = k > 0 ? Math.min(1, k * 3).toFixed(3) : '0';
      L.wrap.style.transformOrigin = `${x}px ${y}px`;
      L.wrap.style.transform = `rotate(${o.rot ?? -8}deg) scale(${(1.6 - 0.6 * ease.back(k)).toFixed(4)})`;
    });
    return L;
  };
})();
