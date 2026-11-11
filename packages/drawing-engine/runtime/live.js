/* Time-driven building blocks: rough shapes re-drawn per frame (liveRough), text that follows lt (follow), bars, slider, KaTeX formula
 * (tex, needs META.libs katex), canvas, a layer mover (move), points along a path (pathAt), and PV.K / PV.keys / PV.mix / PV.arcAt /
 * PV.mmss / PV.softmax. */
(function () {
  const { s, h, col, gen, rrect, clamp, ease, Builder } = PV;
  const B = Builder.prototype;

  /** Eased progress of lt through [a, a + dur]; the easing is a function or its name ('out', 'inOut', 'expo', …). */
  PV.K = (lt, a, dur = 0.6, e = ease.inOut) => {
    const f = typeof e === 'function' ? e : ease[e];
    if (typeof f !== 'function') throw new TypeError(`PV.K(lt, at, dur, easing): easing must be a function or one of ${Object.keys(ease).map((k) => `'${k}'`).join(', ')} — got ${JSON.stringify(e)}`);
    return f(clamp((lt - a) / dur));
  };
  /** softmax(z / T) → probabilities. */
  PV.softmax = (z, T = 1) => {
    const m = Math.max(...z.map((v) => v / T));
    const ex = z.map((v) => (v === -Infinity ? 0 : Math.exp(v / T - m)));
    const sum = ex.reduce((a, b) => a + b, 0);
    return ex.map((v) => v / sum);
  };
  /** Piecewise keyframes → value at lt, eased per segment: PV.keys([[t, v], …], lt, easing). Holds the first / last value outside. */
  PV.keys = (keys, lt, e = ease.inOut) => {
    if (lt <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      if (lt < t1) return v0 + (v1 - v0) * e(clamp((lt - t0) / Math.max(1e-6, t1 - t0)));
    }
    return keys[keys.length - 1][1];
  };
  /** Blend two palette colours: PV.mix('blue', 'red', k) → 'rgb(…)'. */
  PV.mix = (a, b, k) => {
    const hex = (c) => { const v = col(c).replace('#', ''); return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
    const A = hex(a), Z = hex(b);
    return `rgb(${A.map((v, i) => Math.round(v + (Z[i] - v) * clamp(k))).join(',')})`;
  };
  /** Point on an arc from a to b ([x, y] centres) at progress k; arc < 0 bulges upward. */
  PV.arcAt = (a, b, k, arc = -80) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + Math.sin(k * Math.PI) * arc];
  /** 185 → '3:05' */
  PV.mmss = (sec) => { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };

  /** move(L, fn, origin) — drive a layer: fn(lt) → { x, y, s, rot, op } | null (null hides it); x / y are offsets in px. */
  B.move = function (L, fn, origin) {
    if (origin) L.wrap.style.transformOrigin = `${origin[0]}px ${origin[1]}px`;
    this.tick((lt) => {
      const v = fn(lt);
      if (!v) { L.wrap.style.opacity = '0'; return; }
      L.wrap.style.opacity = (v.op ?? 1).toFixed(3);
      L.wrap.style.transform = `translate(${(v.x ?? 0).toFixed(1)}px, ${(v.y ?? 0).toFixed(1)}px) rotate(${(v.rot ?? 0).toFixed(2)}deg) scale(${(v.s ?? 1).toFixed(4)})`;
    });
    return L;
  };
  /** pathAt(d) → { len, at(u) → { x, y, a } } — a point at fraction u of an SVG path's length, a = heading in degrees. */
  B.pathAt = function (d) {
    const p = s('path', { d, fill: 'none', stroke: 'none' }, this.svg);
    const len = p.getTotalLength();
    return {
      len,
      at(u) {
        const l = clamp(u) * len;
        const q = p.getPointAtLength(l), r = p.getPointAtLength(Math.min(len, l + 1)), b = p.getPointAtLength(Math.max(0, l - 1));
        return { x: q.x, y: q.y, a: (Math.atan2(r.y - b.y, r.x - b.x) * 180) / Math.PI };
      },
    };
  };

  /** Paints rough drawables into g (fills with the watercolour filter, then ink on top). */
  function paint(g, items) {
    const strokes = [];
    for (const it of items) {
      if (!it) continue;
      for (const set of it.sets) {
        const d = gen.opsToPath(set, 2), op = it.options;
        if (set.type === 'fillPath') s('path', { d, fill: op.fill, stroke: 'none', filter: 'url(#wc)' }, g);
        else strokes.push({ d, stroke: set.type === 'fillSketch' ? op.fill : op.stroke, w: set.type === 'fillSketch' ? op.fillWeight : op.strokeWidth });
      }
    }
    for (const q of strokes) s('path', { d: q.d, fill: 'none', stroke: q.stroke, 'stroke-width': q.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  }

  /**
   * Rough shapes whose geometry is a function of time: fn(lt, R) → [drawables] | null.
   * R.box(x, y, w, h, o) / R.rect(x, y, w, h, o) / R.path(d, o) / R.circle(cx, cy, d, o) / R.ellipse(cx, cy, w, h, o) /
   * R.line(x1, y1, x2, y2, o) / R.curve(points, o) — the page's own shapes by the same names; seeds stay fixed so the
   * wobble does not boil. A name R does not have says which it has (R.rect was missing, and a page that used it failed
   * with "R.rect is not a function", which its fix round did not mend: 2026-10-27).
   */
  B.liveRough = function (fn, o = {}) {
    const g = s('g', {}, this.svg);
    const seed = this.seed() * 13;
    const ro = (oo = {}, k = 0) => this.ro(Object.assign({}, oo, { seed: oo.seed ?? seed + k }));
    const R = {
      box: (x, y, w, hh, oo = {}) => {
        if (![x, y, w, hh].every(Number.isFinite)) throw new Error(`box(${[x, y, w, hh].join(', ')}) has a non-finite value`);
        return gen.path(rrect(x, y, w, hh, oo.r ?? 10), ro(oo, 1));
      },
      path: (d, oo = {}) => gen.path(d, ro(oo, 2)),
      circle: (cx, cy, d, oo = {}) => gen.circle(cx, cy, d, ro(oo, 3)),
      line: (x1, y1, x2, y2, oo = {}) => gen.line(x1, y1, x2, y2, ro(oo, 4)),
      rect: (x, y, w, hh, oo = {}) => gen.rectangle(x, y, w, hh, ro(oo, 5)),
      ellipse: (cx, cy, w, hh, oo = {}) => gen.ellipse(cx, cy, w, hh, ro(oo, 6)),
      curve: (pts, oo = {}) => gen.curve(pts, ro(oo, 7)),
    };
    const known = Object.keys(R).join(', ');
    const Rp = new Proxy(R, { get: (t, k) => {
      if (typeof k !== 'string' || k in t) return t[k];
      throw new Error(`liveRough's R has no ${k}: it has ${known}`);
    } });
    const id = this.page.id;
    this.tick((lt) => {
      let items;
      try { items = fn(lt, Rp); } catch (e) { e.message = `liveRough @${id} lt=${lt.toFixed(3)}: ${e.message}`; throw e; }   // keep the stack: it points into the page
      g.textContent = '';
      if (items) paint(g, items);
    });
    if (o.opacity) this.tick((lt) => { g.style.opacity = o.opacity(lt).toFixed(3); });
    return g;
  };

  /** A <canvas> redrawn every frame: draw(ctx, lt, w, h). Good for dense things (heatmaps, particles). */
  B.canvas = function (x, y, w, hh, draw) {
    const c = h('canvas', null, null, this.html);
    c.width = w; c.height = hh;
    Object.assign(c.style, { position: 'absolute', left: x + 'px', top: y + 'px' });
    const ctx = c.getContext('2d');
    this.tick((lt) => { ctx.clearRect(0, 0, w, hh); draw(ctx, lt, w, hh); });
    return c;
  };

  /** KaTeX formula. o: { x, y, size, color, align: 'c', w, at } */
  B.tex = function (src, o = {}) {
    const el = h('div', 'tx', null, this.html);
    katex.render(src, el, { throwOnError: false, displayMode: false });
    const w = o.w ?? 900;
    Object.assign(el.style, { left: (o.align === 'c' ? o.x - w / 2 : o.x) + 'px', top: o.y + 'px', fontSize: (o.size ?? 44) + 'px',
      color: col(o.color || 'ink'), width: o.align === 'c' ? w + 'px' : 'auto', textAlign: o.align === 'c' ? 'center' : 'left', whiteSpace: 'nowrap' });
    this.show(el, { at: o.at ?? 0, dur: o.dur ?? 0.6 });
    return el;
  };

  /** Text whose content and position follow lt: fn(lt) → { text, x, y, opacity? } | null. */
  B.follow = function (fn, o = {}) {
    const el = h('div', 'tx ' + (o.font || 'hand'), '', this.html);
    Object.assign(el.style, { fontSize: (o.size ?? 30) + 'px', color: col(o.color || 'ink'), fontWeight: o.weight || 400, whiteSpace: 'nowrap',
      width: (o.w ?? 200) + 'px', textAlign: 'center' });
    this.tick((lt) => {
      const v = fn(lt);
      if (!v) { el.style.opacity = '0'; return; }
      if (el._t !== v.text) { el._t = v.text; el.innerHTML = v.text; }
      el.style.left = (v.x - (o.w ?? 200) / 2).toFixed(1) + 'px';
      el.style.top = v.y.toFixed(1) + 'px';
      el.style.opacity = (v.opacity ?? 1).toFixed(3);
      if (v.color) el.style.color = col(v.color);
    });
    return el;
  };

  /**
   * Bar chart around a baseline. items: [{ label, color }]; value(i, lt) → number (negative goes below).
   * o: { x, base, bw, gap, scale (px per unit), at, fmt(v, i) → str, labelSize, valueSize, axis: true }
   */
  B.bars = function (items, value, o = {}) {
    const bw = o.bw ?? 90, gap = o.gap ?? 40, scale = o.scale ?? 40, base = o.base, x0 = o.x, at = o.at ?? 0;
    const W = items.length * (bw + gap) - gap;
    if (o.axis !== false) this.line(x0 - 30, base, x0 + W + 30, base, { color: 'soft', sw: 2.4, at, dur: 0.5 });
    const grow = (lt) => ease.out(clamp((lt - at - 0.2) / 0.7));
    items.forEach((it, i) => {
      const x = x0 + i * (bw + gap), c = it.color || 'blue';
      this.liveRough((lt, R) => {
        const v = value(i, lt) * grow(lt), hh = Math.abs(v) * scale;
        if (hh < 1) return null;
        return [R.box(x, v >= 0 ? base - hh : base, bw, hh, { r: 8, fill: c + 'F', color: c, sw: 2.4, seed: 100 + i })];
      });
      if (it.label != null) this.text(it.label, { x: x + bw / 2, y: base + (o.labelGap ?? 14), w: bw + gap, align: 'c', size: o.labelSize ?? 34, at: at + 0.3 + i * 0.08, mode: 'fade', color: it.lcolor });
      if (o.fmt) this.follow((lt) => {
        const v = value(i, lt), k = grow(lt);
        if (k <= 0) return null;
        const hh = Math.abs(v * k) * scale, above = v >= 0;
        if (hh < 1) return null;   // no label until the bar is actually there
        return { text: o.fmt(v, i, lt), x: x + bw / 2, y: above ? base - hh - (o.valueSize ?? 30) * 1.5 : base + hh + 8 + (o.negGap ?? 0), opacity: k };
      }, { size: o.valueSize ?? 30, font: o.valueFont || 'latin', color: c, w: bw + gap });
    });
    return { W, x: (i) => x0 + i * (bw + gap) + bw / 2 };
  };

  /** Slider: value(lt) in [min, max]. o: { at, label(v) → str, ticks: [[v, text]] } */
  B.slider = function (x, y, w, min, max, value, o = {}) {
    const at = o.at ?? 0, px = (v) => x + ((v - min) / (max - min)) * w;
    this.line(x, y, x + w, y, { color: 'faint', sw: 6, at, dur: 0.5 });
    for (const [v, t] of o.ticks || []) {
      this.line(px(v), y + 12, px(v), y + 24, { color: 'muted', sw: 2, at: at + 0.2, dur: 0.2 });
      this.text(t, { x: px(v), y: y + 28, w: 160, align: 'c', size: 26, color: 'muted', at: at + 0.3, mode: 'fade' });
    }
    this.liveRough((lt, R) => {
      if (lt < at + 0.3) return null;
      const cx = px(value(lt));
      return [R.line(x, y, cx, y, { color: o.color || 'orange', sw: 6 }), R.circle(cx, y, 44, { fill: 'paper', color: o.color || 'orange', sw: 3.2 })];
    });
    if (o.label) this.follow((lt) => (lt < at + 0.3 ? null : { text: o.label(value(lt)), x: px(value(lt)), y: y - 74 }),
      { size: 36, font: 'latin', weight: 700, color: o.color || 'orange', w: 300 });
  };
})();
