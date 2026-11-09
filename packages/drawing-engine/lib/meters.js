/* Meters: a time histogram with a capacity line and playhead (hist), a vertical level meter (meter), and a stopwatch whose hand
 * follows lt (clock). All pure in lt. */
(function () {
  const { clamp, Builder } = PV;
  const B = Builder.prototype;

  /**
   * hist(o) — bars per time bin, revealed up to clock(lt) (data seconds).
   * o: { x, y, w, h, data: [v per bin], ok: [served per bin], bin, span, cap, maxV, clock(lt), at, tick, seed }
   * Served part is green, the part over capacity is red; bars taller than maxV are clipped and labelled with their value.
   * Returns { X(sec), Y(v), base }.
   */
  B.hist = function (o) {
    const { x, y, w, h: hh, bin, span } = o, at = o.at ?? 0, maxV = o.maxV ?? 200, base = y + hh;
    const X = (s) => x + (s / span) * w, Y = (v) => base - (Math.min(v, maxV) / maxV) * hh;
    this.line(x, base, x + w + 10, base, { color: 'soft', sw: 2.4, at, dur: 0.5 });
    this.line(x, y - 10, x, base, { color: 'soft', sw: 2.2, at, dur: 0.4 });
    for (let s = 0; s <= span + 1e-6; s += o.tick ?? 2) {
      this.text(s + 's', { x: X(s), y: base + 8, w: 80, align: 'c', size: 24, font: 'mono', color: 'muted', at: at + 0.3, mode: 'fade' });
    }
    if (o.cap != null) {
      let d = '';
      for (let sx = x; sx < x + w; sx += 22) d += `M${sx} ${Y(o.cap)} L${Math.min(sx + 12, x + w)} ${Y(o.cap)} `;
      this.path(d, { color: 'green', sw: 2.4, at: at + 0.2, dur: 0.6, single: true, rough: 0.3 });
    }
    const clock = (lt) => (lt < at ? -1 : o.clock(lt));
    const bw = (w / span) * bin, seed = o.seed ?? 70;
    this.liveRough((lt, R) => {
      const t = clock(lt), out = [];
      o.data.forEach((v, i) => {
        if (!v || i * bin >= t) return;
        const grow = clamp((t - i * bin) / 0.35), ok = Math.min(o.ok ? o.ok[i] : v, v) * grow, all = v * grow;
        const bx = X(i * bin) + 1, cw = Math.max(3, bw - 2);
        if (all > ok + 0.5) out.push(R.box(bx, Y(all), cw, Y(ok) - Y(all), { r: 2, fill: 'redF', color: 'red', sw: 1.6, seed: seed + i, rough: 0.5 }));
        if (ok > 0.5) out.push(R.box(bx, Y(ok), cw, base - Y(ok), { r: 2, fill: 'greenF', color: 'green', sw: 1.6, seed: seed + 500 + i, rough: 0.5 }));
      });
      if (o.playhead !== false && t > 0) { const px = X(Math.min(t, span)); out.push(R.line(px, y - 20, px, base + 4, { color: 'ink', sw: 2.2, seed: 9, rough: 0.3 })); }
      return out;
    });
    // value labels for clipped spikes
    o.data.forEach((v, i) => {
      if (v <= maxV) return;
      this.follow((lt) => {
        const t = clock(lt);
        if (t <= i * bin) return null;
        return { text: String(v), x: X(i * bin + bin / 2), y: y - 44, opacity: clamp((t - i * bin) / 0.3) };
      }, { size: 24, font: 'latin', weight: 700, color: 'red', w: 90 });
    });
    return { X, Y, base, clock };
  };

  /** meter(x, y, w, h, level(lt) → 0..1, o) — a tall gauge that fills from the bottom; turns red past o.warn (0.9). */
  B.meter = function (x, y, w, hh, level, o = {}) {
    const at = o.at ?? 0, warn = o.warn ?? 0.9, c = o.color || 'blue';
    this.box(x, y, w, hh, { r: 10, fill: 'paper', color: 'soft', sw: 2.4, at, dur: 0.5, texture: false });
    this.liveRough((lt, R) => {
      if (lt < at + 0.2) return null;
      const v = clamp(level(lt)), fh = (hh - 8) * v;
      if (fh < 2) return null;
      const k = v >= warn ? 'red' : c;
      return [R.box(x + 4, y + hh - 4 - fh, w - 8, fh, { r: 6, fill: k + 'F', color: k, sw: 2, seed: o.seed ?? 5, rough: 0.6 })];
    });
    if (o.label) this.text(o.label, { x: x + w / 2, y: y + hh + 10, w: o.lw ?? 220, align: 'c', size: o.size ?? 26, weight: 700, color: o.lcolor || 'ink', at: at + 0.2, mode: 'fade' });
  };

  /** clock(cx, cy, d, turns(lt) → number of full turns, o) — a stopwatch face; the hand is re-drawn per frame. */
  B.clock = function (cx, cy, d, turns, o = {}) {
    const at = o.at ?? 0, c = o.color || 'ink', r = d / 2;
    this.circle(cx, cy, d, { fill: o.fill || 'paper', color: c, sw: 3, at, dur: 0.6 });
    this.box(cx - 10, cy - r - 18, 20, 16, { r: 4, color: c, sw: 2.4, at: at + 0.2, dur: 0.2, texture: false });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r1 = r - 6, r2 = r - (i % 3 ? 14 : 22);
      this.line(cx + Math.sin(a) * r1, cy - Math.cos(a) * r1, cx + Math.sin(a) * r2, cy - Math.cos(a) * r2, { color: 'muted', sw: 2, at: at + 0.3, dur: 0.1, single: true });
    }
    this.liveRough((lt, R) => {
      if (lt < at + 0.3) return null;
      const a = turns(lt) * Math.PI * 2, L = r - 26;
      const hc = typeof o.hand === 'function' ? o.hand(lt) : o.hand || c;
      return [R.line(cx, cy, cx + Math.sin(a) * L, cy - Math.cos(a) * L, { color: hc, sw: 4, seed: 11, rough: 0.3, single: true }), R.circle(cx, cy, 12, { fill: hc, color: hc, sw: 2, seed: 12 })];
    });
  };
})();
