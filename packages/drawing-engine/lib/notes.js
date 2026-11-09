/* Notes: a file card whose rows are written in over time (memfile), a note card with a dog-ear (mcard), a highlighter that swipes
 * each rendered line (markLines) and colours for a card that ages from fresh to stale (PV.age). All pure in lt. */
(function () {
  const { clamp, lerp, Builder } = PV;
  const B = Builder.prototype;

  /**
   * memfile(x, y, w, rows, o) — a paper file card: mono file name on a header strip, then hand-written rows.
   * rows: [{ text, at, color, size }]. o: { at, name, size, rowH, color, h }. Returns { L, rowY(i), h, texts }.
   */
  B.memfile = function (x, y, w, rows, o = {}) {
    const L = o.layer === false ? this : this.layer(), at = o.at ?? 0, size = o.size ?? 30, rh = o.rowH ?? size * 1.6, c = o.color || 'soft';
    const hh = o.h ?? 74 + rows.length * rh + 26;
    L.box(x, y, w, hh, { r: 14, fill: 'paper', color: c, sw: 2.4, at, dur: 0.6, texture: false });
    L.line(x + 4, y + 58, x + w - 4, y + 58, { color: 'faint', sw: 2, at: at + 0.3, dur: 0.3 });
    L.text(o.name ?? 'notes.md', { x: x + 24, y: y + 12, size: 26, font: 'mono', weight: 700, color: c, at: at + 0.3, mode: 'fade', raw: true });
    const rowY = (i) => y + 74 + i * rh;
    const texts = rows.map((r, i) => L.text(r.text, { x: x + 28, y: rowY(i), size: r.size ?? size, color: r.color || 'ink', at: r.at ?? at + 0.5 + i * 0.2, cps: r.cps ?? 22, w: r.w }));
    return { L, rowY, h: hh, texts, rh };
  };

  /**
   * mcard(x, y, w, h, o) — one note card with a folded corner. o: { at, title, body, color, fill, size, tsize, date }.
   * Draws on its own layer (so the page can move it). Returns the layer.
   */
  B.mcard = function (x, y, w, hh, o = {}) {
    const L = o.layer || this.layer(), at = o.at ?? 0, c = o.color || 'purple', f = 34;
    L.path(`M${x} ${y + 10} Q${x} ${y} ${x + 10} ${y} H${x + w - f} L${x + w} ${y + f} V${y + hh - 10} Q${x + w} ${y + hh} ${x + w - 10} ${y + hh} H${x + 10} Q${x} ${y + hh} ${x} ${y + hh - 10} Z`,
      { fill: o.fill || c + 'F', color: c, sw: 2.4, at, dur: 0.5, rough: 0.7 });
    L.path(`M${x + w - f} ${y} V${y + f} H${x + w}`, { color: c, sw: 2, at: at + 0.3, dur: 0.2, rough: 0.5 });
    if (o.title) L.text(o.title, { x: x + 22, y: y + 14, size: o.tsize ?? 26, color: c, weight: 700, at: at + 0.25, mode: 'fade' });
    if (o.body) L.text(o.body, { x: x + 22, y: y + (o.title ? 56 : 18), w: w - 44, size: o.size ?? 32, color: o.bcolor || 'ink', at: at + 0.35, mode: o.mode || 'fade', cps: 20, lh: 1.35 });
    if (o.date) L.text(o.date, { x: x + w - 22, y: y + hh - 42, w: w - 44, align: 'r', size: 24, color: 'muted', at: at + 0.4, mode: 'fade' });
    return L;
  };

  /** Highlighter over chars i0..i1 of a text handle, one swipe per rendered line (markSpan draws one box over all lines). */
  B.markLines = function (hnd, i0, i1, o = {}) {
    const groups = [];
    for (let i = i0; i <= i1; i++) {
      const top = Math.round(hnd.spans[i].getBoundingClientRect().top);
      const g = groups[groups.length - 1];
      if (g && Math.abs(g.top - top) < 4) g.b = i; else groups.push({ top, a: i, b: i });
    }
    return groups.map((g, k) => this.markSpan(hnd, g.a, g.b, Object.assign({}, o, { at: (o.at ?? 0) + k * 0.3 })));
  };

  /** Colour of a card that ages from fresh (0) through yellowed (0.5) to stale red (1): returns { fill, stroke } as css colours. */
  PV.age = (k) => {
    const mix = PV.mix;
    return k < 0.5 ? { fill: mix('purpleF', 'orangeF', k * 2), stroke: mix('purple', 'orange', k * 2) }
      : { fill: mix('orangeF', 'redF', (k - 0.5) * 2), stroke: mix('orange', 'red', (k - 0.5) * 2) };
  };

  /** Deterministic per-index thresholds in [0, 1): PV.thresholds(n, seed) — same list every frame. */
  PV.thresholds = (n, seed = 7) => { const r = PV.rng(seed); return Array.from({ length: n }, () => r()); };
  PV.lerp2 = (a, b, k) => lerp(a, b, clamp(k));
})();
