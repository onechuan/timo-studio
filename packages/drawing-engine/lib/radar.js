/* A radar chart whose values follow lt (radar), and a stack of chat messages whose rows can shrink in place or roll up into one
 * card (msgs). Pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;

  /**
   * radar(cx, cy, r, axes, vals, o) — one axis per item of axes: [{ label, color }] (axis 0 points up, then clockwise).
   * vals(lt) → [0..1] per axis | null. o: { at, color(lt) → key, size }. Grid and labels draw on at; the polygon follows lt.
   */
  B.radar = function (cx, cy, r, axes, vals, o = {}) {
    const at = o.at ?? 0, n = axes.length;
    const pt = (i, rr) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    const poly = (rr) => Array.from({ length: n }, (_, i) => pt(i, rr)).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
    [0.33, 0.66, 1].forEach((f, k) => this.path(poly(r * f), { color: 'faint', sw: 2, at: at + k * 0.12, dur: 0.5, rough: 0.5 }));
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, r);
      this.line(cx, cy, x, y, { color: 'faint', sw: 2, at: at + 0.2, dur: 0.4 });
      const d = axes[i], [lx, ly] = pt(i, r + 70);
      this.text(d.label, { x: lx, y: ly - 34, w: 200, align: 'c', size: o.size ?? 28, weight: 700, color: d.color || 'ink', at: at + 0.3 + i * 0.08, mode: 'fade', lh: 1.1 });
    }
    this.liveRough((lt, R) => {
      const v = lt < at + 0.5 ? null : vals(lt);
      if (!v) return null;
      const c = o.color ? o.color(lt) : 'blue';
      const d = v.map((x, i) => pt(i, r * Math.max(0.04, x))).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
      return [R.path(d, { fill: c + 'F', color: c, sw: 3.4, seed: 17, rough: 0.6 }),
        ...v.map((x, i) => { const [px, py] = pt(i, r * Math.max(0.04, x)); return R.circle(px, py, 18, { fill: c, color: c, sw: 2, seed: 30 + i }); })];
    });
    return { pt };
  };

  /**
   * msgs(x, y, rows, o) — a stack of chat messages (a conversation, a log). rows: [{ role, w, color, label }] (w = full width in px).
   * o: { at, rh, gap, width(i, lt) → 0..1 scale, label(i, lt) → str | null, roll(lt) → 0..1 (rows fly into one card),
   *      card: { x, y, w, h, color, text } }. Row i appears at o.at + i * 0.12.
   */
  B.msgs = function (x, y, rows, o = {}) {
    const rh = o.rh ?? 52, gap = o.gap ?? 12, at = o.at ?? 0, roll = o.roll || (() => 0), cd = o.card;
    const rowY = (i) => y + i * (rh + gap);
    const RW = 150; // role column
    this.liveRough((lt, R) => {
      const k = ease.inOut(clamp(roll(lt))), out = [];
      rows.forEach((rw, i) => {
        const t0 = at + i * 0.12;
        if (lt < t0) return;
        const g = ease.out(clamp((lt - t0) / 0.4));
        const f = o.width ? o.width(i, lt) : 1;
        let bx = x + RW, by = rowY(i), bw = Math.max(20, rw.w * f * g), bh = rh;
        if (k > 0 && cd) { bx = lerp(bx, cd.x + 20, k); by = lerp(by, cd.y + cd.h / 2 - 10, k); bw = lerp(bw, cd.w - 40, k); bh = lerp(bh, 20, k); }
        if (k < 0.97) out.push(R.box(bx, by, bw, bh, { r: 10, fill: (rw.color || 'blue') + 'F', color: rw.color || 'blue', sw: 2.2, seed: 500 + i * 3, rough: 0.7 }));
      });
      if (cd && k > 0.55) {
        const q = clamp((k - 0.55) / 0.45);
        out.push(R.box(cd.x, cd.y + cd.h * (1 - q) / 2, cd.w, cd.h * q, { r: 16, fill: (cd.color || 'purple') + 'F', color: cd.color || 'purple', sw: 3, seed: 590 }));
      }
      return out;
    });
    rows.forEach((rw, i) => {
      this.follow((lt) => {
        const t0 = at + i * 0.12, k = clamp(roll(lt) * 3);
        return lt < t0 + 0.2 ? null : { text: rw.role, x: x + RW / 2 - 10, y: rowY(i) + rh / 2 - 17, opacity: 1 - k };
      }, { size: 24, font: 'mono', color: rw.color || 'blue', w: RW });
      const el = this.follow((lt) => {
        const t0 = at + i * 0.12, k = clamp(roll(lt) * 3);
        const s = o.label ? o.label(i, lt) : rw.label;
        return lt < t0 + 0.3 || !s ? null : { text: s, x: x + RW + 18 + 330, y: rowY(i) + rh / 2 - 17, opacity: 1 - k };
      }, { size: 24, font: 'mono', color: 'ink', w: 660 });
      el.style.textAlign = 'left';
    });
    if (cd && cd.text) this.follow((lt) => {
      const q = clamp((roll(lt) - 0.8) / 0.2);
      return q <= 0 ? null : { text: cd.text, x: cd.x + cd.w / 2, y: cd.y + cd.h / 2 - 22, opacity: q };
    }, { size: 30, weight: 700, color: cd.color || 'purple', w: cd.w - 30 });
    return { rowY, RW };
  };
})();
