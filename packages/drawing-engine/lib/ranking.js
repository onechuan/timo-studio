/* Rankings: a table whose rows slide smoothly between ranks (rankList), rank positions that move softly as scores cross
 * (PV.softPos) or between keyframed orders (PV.orderPos), a tower of stacked slabs (tower), and a projector that fits 2D points
 * into a box (PV.proj2d). All pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;

  /** Soft rank of id among scores {id: s}: Σ σ((s_j − s_i)/τ). Rows swap smoothly as scores cross. null score → far below. */
  PV.softPos = (scores, id, tau = 0.006) => {
    const si = scores[id];
    if (si == null) return 99;
    let p = 0;
    for (const j in scores) if (j !== id && scores[j] != null) p += 1 / (1 + Math.exp(-(scores[j] - si) / tau));
    return p;
  };
  /** Keyframed orders: keys = [[t, [ids…]], …]; position eases from one order to the next over dur. Missing id → below the list. */
  PV.orderPos = (keys, id, lt, dur = 0.9) => {
    const idx = (o) => { const i = o.indexOf(id); return i < 0 ? o.length + 3 : i; };
    let p = idx(keys[0][1]);
    for (let k = 1; k < keys.length; k++) if (lt > keys[k][0]) p = lerp(p, idx(keys[k][1]), ease.inOut(clamp((lt - keys[k][0]) / dur)));
    return p;
  };

  /**
   * rankList(o) — rows on their own layers, sliding to pos(id, lt) (0-based, fractional). Fixed rank numbers on the left, optional Top-K line.
   * o: { x, y, w, rowH, gap, items: [{ id, label, color }], pos(id, lt), show (rows visible), at, stagger, score(id, lt) → str | null,
   *      size, cut (Top-K), cutLabel, nums: true }. Returns { Y(i) → row top, rows: {id: layer} }.
   */
  B.rankList = function (o) {
    const rowH = o.rowH ?? 62, gap = o.gap ?? 12, step = rowH + gap, show = o.show ?? 5, at = o.at ?? 0, size = o.size ?? 30, st = o.stagger ?? 0.08;
    const Y = (i) => o.y + i * step;
    if (o.nums !== false) for (let i = 0; i < show; i++) this.text(String(i + 1), { x: o.x - 64, y: Y(i) + (rowH - 40 * 1.3) / 2, size: 40, font: 'latin', weight: 700, color: 'muted', at: at + i * st, mode: 'fade' });
    if (o.cut) {
      const cy = Y(o.cut) - gap / 2;
      this.line(o.x - 90, cy, o.x + o.w + 30, cy, { color: 'red', sw: 3, at: o.cutAt ?? at + 0.4, dur: 0.5, rough: 0.6 });
      this.text(o.cutLabel ?? `Top-${o.cut}`, { x: o.x + o.w + 40, y: cy - 22, size: 28, font: 'latin', weight: 700, color: 'red', at: (o.cutAt ?? at + 0.4) + 0.3, mode: 'fade' });
    }
    const rows = {};
    o.items.forEach((it, i) => {
      const L = this.layer(), c = it.color || 'soft', t = it.at ?? at + i * st;
      L.box(o.x, o.y, o.w, rowH, { r: 12, fill: it.fill || (it.color ? c + 'F' : 'paper'), color: c, sw: it.color ? 2.8 : 2.2, at: t, dur: 0.4, texture: false, rough: 0.7 });
      L.text(it.label, { x: o.x + 22, y: o.y + (rowH - size * 1.45) / 2, size, weight: it.color ? 700 : 400, color: it.color ? c : 'ink', at: t + 0.15, mode: 'fade', raw: true });
      if (o.score) L.live(o.x + o.w - 80, o.y + (rowH - size * 1.3) / 2, (lt) => o.score(it.id, lt) ?? '', { align: 'c', w: 150, size, font: 'latin', weight: 700, color: it.color ? c : 'soft', at: t + 0.2 });
      this.tick((lt) => {
        const p = o.pos(it.id, lt);
        L.wrap.style.transform = `translateY(${(p * step).toFixed(1)}px)`;
        L.wrap.style.opacity = clamp(show - 0.15 - p, 0, 1).toFixed(3);
      });
      rows[it.id] = L;
    });
    return { Y, rows, step };
  };

  /** tower(cx, y, w, h, o) — a block drawn as stacked slabs (a model, a building, a stack of layers). o: { at, color, label, n }. */
  B.tower = function (cx, y, w, hh, o = {}) {
    const n = o.n ?? 5, c = o.color || 'blue', at = o.at ?? 0, sh = (hh - (n - 1) * 10) / n;
    for (let i = 0; i < n; i++) this.box(cx - w / 2, y + i * (sh + 10), w, sh, { r: 10, fill: c + 'F', color: c, sw: 2.4, at: at + i * 0.08, dur: 0.35, texture: false, rough: 0.8 });
    if (o.label) this.text(o.label, { x: cx, y: y + hh + 14, w: w + 200, align: 'c', size: 28, weight: 700, color: c, at: at + 0.4, mode: 'fade' });
  };

  /** proj2d(pts, box) — fit {id: [a, b]} into box {x, y, w, h}; returns (id | [a, b]) → [px, py]. */
  PV.proj2d = (pts, bx, pad = 0.08) => {
    const V = Object.values(pts), ax = V.map((p) => p[0]), ay = V.map((p) => p[1]);
    const x0 = Math.min(...ax), x1 = Math.max(...ax), y0 = Math.min(...ay), y1 = Math.max(...ay);
    return (p) => {
      const [a, b] = typeof p === 'string' ? pts[p] : p;
      return [bx.x + bx.w * (pad + (1 - 2 * pad) * (a - x0) / (x1 - x0)), bx.y + bx.h * (1 - pad - (1 - 2 * pad) * (b - y0) / (y1 - y0))];
    };
  };
})();
