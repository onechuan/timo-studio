/* Switches and tracks: a breaker switch that trips (breaker), a horizontal meter with threshold lines (hbar), a monospace tag (mtag),
 * a loop of stages on an ellipse with a travelling dot (loopTrack) and exit doors that light up (door). All pure in lt. */
(function () {
  const { clamp, lerp, ease, col, h, Builder } = PV;
  const B = Builder.prototype;

  /** Mono-font tag (for hashes, tool names): rounded box + monospace label. o: { at, color, h, size, fill } */
  B.mtag = function (x, y, w, label, o = {}) {
    const hh = o.h ?? 52, at = o.at ?? 0, c = o.color || 'soft', size = o.size ?? 26;
    const box = this.box(x, y, w, hh, { r: 10, fill: o.fill || c + 'F', color: c, at, dur: 0.4, sw: 2.2, rough: 0.7, texture: false });
    const text = this.text(label, { x: x + w / 2, y: y + (hh - size * 1.3) / 2, w, align: 'c', size, font: 'mono', weight: o.weight ?? 700, color: o.tcolor || c, at: at + 0.15, mode: 'fade', dur: 0.3, raw: true });
    return { box, text, hide(t, d) { box.hide(t, d); text.hide(t, d); } };
  };

  /**
   * breaker(x, y, o) — a wall breaker switch (box + lever). Lever is up (ON, green) until o.trip, then snaps down (OFF, red).
   * o: { at, trip, w, h, label }. Returns { tripped(lt) }.
   */
  B.breaker = function (x, y, o = {}) {
    const at = o.at ?? 0, w = o.w ?? 150, hh = o.h ?? 230, trip = o.trip ?? 1e9;
    this.box(x, y, w, hh, { r: 16, fill: 'paper', color: 'ink', sw: 3, at, dur: 0.6, texture: false });
    this.box(x + w * 0.3, y + hh * 0.18, w * 0.4, hh * 0.64, { r: 10, fill: 'faint', color: 'soft', sw: 2, at: at + 0.3, dur: 0.4, texture: false });
    const k = (lt) => ease.back(clamp((lt - trip) / 0.3));
    this.liveRough((lt, R) => {
      if (lt < at + 0.5) return null;
      const u = k(lt), off = lt >= trip;
      const cy = lerp(y + hh * 0.3, y + hh * 0.7, u), c = off ? 'red' : 'green';
      return [R.box(x + w * 0.22, cy - 22, w * 0.56, 44, { r: 8, fill: c + 'F', color: c, sw: 3, seed: 7 })];
    });
    this.follow((lt) => (lt < at + 0.5 ? null : { text: lt >= trip ? 'OFF' : 'ON', x: x + w / 2, y: y + hh + 10, color: lt >= trip ? 'red' : 'green' }),
      { size: 34, font: 'latin', weight: 700, w });
    if (o.label) this.text(o.label, { x: x + w / 2, y: y - 50, w: w + 160, align: 'c', size: 30, weight: 700, at: at + 0.3, mode: 'fade' });
    return { tripped: (lt) => lt >= trip };
  };

  /**
   * hbar(x, y, w, h, value, o) — horizontal meter. value(lt) in units; o: { max, at, marks: [[v, label, color]], color(v) → colour,
   *   fmt(v) → str (shown right of the fill), over: true to let the fill run past max (drawn red) }
   */
  B.hbar = function (x, y, w, hh, value, o = {}) {
    const max = o.max ?? 100, at = o.at ?? 0, X = (v) => x + (v / max) * w;
    this.box(x, y, w, hh, { r: 12, fill: 'paper', color: 'soft', sw: 2.4, at, dur: 0.6, texture: false });
    for (const [v, t, c] of o.marks || []) {
      this.line(X(v), y - 18, X(v), y + hh + 18, { color: c || 'muted', sw: 3, at: at + 0.3, dur: 0.3 });
      if (t) this.text(t, { x: X(v), y: y + hh + 22, w: 220, align: 'c', size: 26, weight: 700, color: c || 'muted', at: at + 0.4, mode: 'fade' });
    }
    this.liveRough((lt, R) => {
      if (lt < at + 0.4) return null;
      const v = value(lt);
      if (v <= 0.001) return null;
      const out = [];
      const vin = Math.min(v, max), c = o.color ? o.color(v) : 'blue';
      out.push(R.box(x + 4, y + 5, Math.max(6, X(vin) - x - 8), hh - 10, { r: 9, fill: c + 'F', color: c, sw: 2.2, seed: 21, rough: 0.8 }));
      if (o.over && v > max) out.push(R.box(X(max), y + 5, X(v) - X(max), hh - 10, { r: 9, fill: 'redF', color: 'red', sw: 2.2, seed: 23, rough: 0.8 }));
      return out;
    });
    if (o.fmt) this.follow((lt) => (lt < at + 0.4 ? null : { text: o.fmt(value(lt)), x: Math.max(X(Math.min(value(lt), o.over ? 1e9 : max)), x) + 110, y: y + hh / 2 - 22 }),
      { size: 30, font: 'latin', weight: 700, color: o.fcolor || 'ink', w: 200 });
    return { X };
  };

  /**
   * loopTrack(cx, cy, rx, ry, stages, o) — a cycle drawn as an ellipse with stage boxes on it and a dot travelling clockwise.
   * stages: [{ a (turns from top, clockwise), label, color, w }]; o: { at, pos(lt) → turns | null, size }
   * Returns { pt(turns, grow) → [x, y], stage(i) → { x, y } }.
   */
  B.loopTrack = function (cx, cy, rx, ry, stages, o = {}) {
    const at = o.at ?? 0;
    const pt = (u, g = 0) => { const a = u * Math.PI * 2; return [cx + (rx + g) * Math.sin(a), cy - (ry + g * ry / rx) * Math.cos(a)]; };
    // the ring itself, as arrowed arcs between stages
    const n = stages.length;
    stages.forEach((s, i) => {
      const a0 = s.a + 0.055, a1 = (i + 1 < n ? stages[i + 1].a : stages[0].a + 1) - 0.055;
      const pts = [];
      for (let k = 0; k <= 16; k++) pts.push(pt(lerp(a0, a1, k / 16)));
      const d = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      this.arrow(0, 0, 0, 0, { d, color: 'soft', sw: 3, head: 16, at: at + 0.3 + i * 0.2, dur: 0.5 });
    });
    const boxes = stages.map((s, i) => {
      const [x, y] = pt(s.a), w = s.w ?? o.bw ?? 220, hh = o.bh ?? 70;
      this.box(x - w / 2, y - hh / 2, w, hh, { r: 16, fill: (s.color || 'blue') + 'F', color: s.color || 'blue', sw: 2.6, at: at + i * 0.2, dur: 0.5, texture: false });
      this.text(s.label, { x, y: y - (o.size ?? 30) * 0.72, w: w + 20, align: 'c', size: o.size ?? 30, weight: 700, color: s.color || 'blue', at: at + 0.2 + i * 0.2, mode: 'fade' });
      return { x, y, w };
    });
    if (o.pos) this.liveRough((lt, R) => {
      const p = o.pos(lt);
      if (p == null) return null;
      const [x, y] = pt(p, o.inset ?? -58);
      return [R.circle(x, y, 34, { fill: 'yellow', color: 'orange', sw: 2.6, seed: 71 })];
    });
    return { pt, stage: (i) => boxes[i] };
  };

  /**
   * door(x, y, label, o) — an exit door chip: a little door icon + a label; dim until o.on, then lit in o.color with a pop.
   * o: { at, on, color, w }
   */
  B.door = function (x, y, label, o = {}) {
    const at = o.at ?? 0, on = o.on ?? 1e9, c = o.color || 'red', w = o.w ?? 250, hh = 58, fs = o.size ?? 26;
    const L = this.layer();
    L.box(x, y, w, hh, { r: 12, fill: 'paper', color: 'faint', sw: 2.2, at, dur: 0.4, texture: false });
    const lit = this.layer();
    lit.box(x, y, w, hh, { r: 12, fill: c + 'F', color: c, sw: 2.8, at: -5, dur: 0.01, texture: false });
    L.icon('door', x + 32, y + hh / 2, 44, { at: at + 0.1 });
    lit.icon('door', x + 32, y + hh / 2, 44, { at: -5, color: c });
    L.text(label, { x: x + 62, y: y + (hh - fs * 1.3) / 2, size: fs, font: 'mono', weight: 700, color: 'muted', at: at + 0.2, mode: 'fade', raw: true });
    lit.text(label, { x: x + 62, y: y + (hh - fs * 1.3) / 2, size: fs, font: 'mono', weight: 700, color: c, at: -5, mode: 'fade', dur: 0.01, raw: true });
    this.tick((lt) => {
      const k = clamp((lt - on) / 0.3);
      lit.wrap.style.opacity = k.toFixed(3);
      const s = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.08 : 1;
      lit.wrap.style.transformOrigin = `${x + w / 2}px ${y + hh / 2}px`;
      lit.wrap.style.transform = `scale(${s.toFixed(4)})`;
    });
    return { L, lit };
  };
})();
