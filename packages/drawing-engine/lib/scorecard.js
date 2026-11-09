/* Scores: a row of tubes that fill to a level each (scoretubes), a ruler split into coloured segments (ruler), and a logo + name badge
 * (badge). Items are [{ label, color }], one colour each; levels name the score steps. All pure in lt. */
(function () {
  const { clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;

  /** badge(x, y, name, o) — a logo (a key in PV.LOGOS, see P.logo) + a name, left-aligned at (x, y = vertical centre). o: { at, size, logo, logoSize, color } */
  B.badge = function (x, y, name, o = {}) {
    const size = o.size ?? 36, at = o.at ?? 0, lg = o.logoSize ?? size * 1.3;
    let tx = x;
    if (o.logo) { this.logo(o.logo, x + lg / 2, y, lg, { at }); tx = x + lg + 14; }
    return this.text(name, { x: tx, y: y - size * 0.72, size, weight: 700, font: 'latin', color: o.color || 'ink', at: at + 0.15, mode: 'fade' });
  };

  /**
   * scoretubes(x, y, items, o) — one vertical tube per item; tube i fills to val(i, lt) (0 .. the top level). Optional second segment on
   * top: extra(i, lt). o: { at, levels: names of the score steps from 0, e.g. ['', 'basic', 'complete', 'thorough'] (default four unnamed steps, 0..3), tw: 104, gap: 34, h: 300,
   *   val, extra, extraColor: 'faint', labels: true, showLevels: true, size }
   * Returns { cx(i) → tube centre x, top(i, lt) → screen y of the fill top, W }.
   */
  B.scoretubes = function (x, y, items, o = {}) {
    const tw = o.tw ?? 104, gap = o.gap ?? 34, hh = o.h ?? 300, at = o.at ?? 0, size = o.size ?? 26, n = items.length;
    const LV = o.levels || ['', '', '', ''], top = LV.length - 1;
    const W = n * tw + (n - 1) * gap, unit = hh / top, base = y + hh;
    const cx = (i) => x + i * (tw + gap) + tw / 2;
    if (o.showLevels !== false) {
      LV.forEach((name, k) => {
        if (!k) return;
        this.line(x - 16, base - k * unit, x + W + 8, base - k * unit, { color: 'faint', sw: 1.4, at: at + 0.1, dur: 0.5, rough: 0.3 });
        if (name) this.text(name, { x: x - 24, y: base - k * unit - size * 0.7, size: 24, align: 'r', w: 140, color: 'muted', at: at + 0.3, mode: 'fade' });
      });
    }
    items.forEach((p, i) => {
      this.box(x + i * (tw + gap), y, tw, hh, { r: 16, color: p.color, sw: 2.6, at: at + i * 0.06, dur: 0.5, texture: false, rough: 0.6 });
      if (o.labels !== false) this.text(p.label, { x: cx(i), y: base + 12, w: tw + gap, align: 'c', size, weight: 700, color: p.color, at: at + 0.2 + i * 0.06, mode: 'fade' });
    });
    const fill = (i, lt) => clamp(o.val ? o.val(i, lt) : 0, 0, top);
    const ex = (i, lt) => clamp(o.extra ? o.extra(i, lt) : 0, 0, top - fill(i, lt));
    this.liveRough((lt, R) => {
      const out = [];
      items.forEach((p, i) => {
        const v = fill(i, lt), e = ex(i, lt), bx = x + i * (tw + gap) + 8;
        if (v * unit > 4) out.push(R.box(bx, base - v * unit + 2, tw - 16, v * unit - 8, { r: 10, fill: p.color + 'F', color: p.color, sw: 2, seed: 70 + i, rough: 0.6 }));
        if (e * unit > 4) out.push(R.box(bx, base - (v + e) * unit + 2, tw - 16, e * unit - 4, { r: 10, fill: 'paper', color: o.extraColor || 'muted', sw: 2.4, seed: 90 + i, rough: 0.9 }));
      });
      return out;
    });
    return { cx, W, top: (i, lt) => base - (fill(i, lt) + ex(i, lt)) * unit, base, unit };
  };

  /** Fill helper: tube i rises to target v at time t(i) (eased 0.7 s). */
  PV.rise = (vals, t) => (i, lt) => vals[i] * ease.out(clamp((lt - t(i)) / 0.7));

  /**
   * ruler(x, y, w, items, o) — a long hand-drawn ruler split into one coloured segment per item, each with its label.
   * o: { at, h: 110, size: 30 } — draws on at; returns { seg(i) → { x, w } }.
   */
  B.ruler = function (x, y, w, items, o = {}) {
    const hh = o.h ?? 110, at = o.at ?? 0, sw = w / items.length, size = o.size ?? 30;
    this.box(x, y, w, hh, { r: 12, fill: 'yellow', color: 'ink', sw: 3, at, dur: 0.6, texture: false, rough: 0.8 });
    for (let k = 1; k < 60; k++) {
      const tx = x + (k * w) / 60, big = k % 10 === 0;
      this.line(tx, y, tx, y + (big ? 34 : k % 5 === 0 ? 24 : 14), { color: 'ink', sw: big ? 2.6 : 1.6, at: at + 0.3 + k * 0.006, dur: 0.1, rough: 0.2 });
    }
    items.forEach((p, i) => {
      this.box(x + i * sw + 8, y + hh - 56, sw - 16, 46, { r: 10, fill: p.color + 'F', color: p.color, sw: 2, at: at + 0.5 + i * 0.08, dur: 0.3, texture: false, rough: 0.5 });
      this.text(p.label, { x: x + i * sw + sw / 2, y: y + hh - 55, w: sw, align: 'c', size, weight: 700, color: p.color, at: at + 0.6 + i * 0.08, mode: 'fade' });
    });
    return { seg: (i) => ({ x: x + i * sw, w: sw }) };
  };
})();
