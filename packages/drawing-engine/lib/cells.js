/* Cells: a grid of cells filled in reading order (cells), a framed window of them with a live counter (win), number formatting
 * (PV.fmt, PV.fmtK) and a per-layer 3D placer (place3d). All pure in lt. */
(function () {
  const { clamp, ease, Builder } = PV;
  const B = Builder.prototype;
  const PAL = ['blue', 'orange', 'green', 'purple', 'red'];

  /** 185317 → '185,317'; fmtK(42679) → '42.7K'. */
  PV.fmt = (v) => Math.round(v).toLocaleString('en-US');
  PV.fmtK = (v) => (v >= 1000 ? (v / 1000).toFixed(v >= 100000 ? 0 : 1) + 'K' : String(Math.round(v)));

  /**
   * cells(o) — cols×rows cells filled in reading order (one cell per unit of what is counted).
   * o: { x, y, cols, rows, cell, gap, n(lt) → cells filled (fractional ok), color(i) → key, op(i, lt, n) → opacity mult, at }
   * Each cell is a static rough box whose opacity follows lt (cheap: no redraw per frame). Returns { X(i), Y(i), W, H }.
   */
  B.cells = function (o) {
    const cell = o.cell ?? 36, gap = o.gap ?? 6, st = cell + gap, N = o.cols * o.rows;
    const X = (i) => o.x + (i % o.cols) * st, Y = (i) => o.y + Math.floor(i / o.cols) * st;
    const els = [];
    for (let i = 0; i < N; i++) {
      const c = o.color ? o.color(i) : PAL[i % PAL.length];
      const hnd = this.box(X(i), Y(i), cell, cell, { r: 6, fill: c + 'F', color: c, sw: 1.8, rough: 0.6, texture: false, at: -5, dur: 0.01, pen: false });
      els.push(hnd.el);
    }
    this.tick((lt) => {
      const n = o.n(lt);
      els.forEach((el, i) => {
        const k = clamp(n - i) * (o.op ? o.op(i, lt, n) : 1);
        const v = k.toFixed(3);
        if (el._v !== v) { el._v = v; el.style.opacity = v; }
      });
    });
    return { X, Y, W: o.cols * st - gap, H: o.rows * st - gap };
  };

  /**
   * win(o) — a window of cells: frame + title + cell grid + live counter under it.
   * o: { x, y, cols, rows, cell, gap, title, color, at, n(lt), cellColor(i), op, label(lt) → str | null, tsize }
   */
  B.win = function (o) {
    const cell = o.cell ?? 36, gap = o.gap ?? 6, pad = o.pad ?? 18, head = o.head ?? 58;
    const W = o.cols * (cell + gap) - gap + pad * 2, H = o.rows * (cell + gap) - gap + pad * 2 + head;
    const c = o.color || 'soft', at = o.at ?? 0;
    this.box(o.x, o.y, W, H, { r: 18, fill: 'paper', color: c, sw: 2.8, at, dur: 0.6, texture: false });
    if (o.title) this.text(o.title, { x: o.x + pad, y: o.y + 10, size: o.tsize ?? 30, weight: 700, color: c, at: at + 0.3, mode: 'fade' });
    this.line(o.x + 8, o.y + head - 4, o.x + W - 8, o.y + head - 4, { color: 'faint', sw: 2, at: at + 0.3, dur: 0.3 });
    const g = this.cells({ x: o.x + pad, y: o.y + head + pad - 4, cols: o.cols, rows: o.rows, cell, gap, n: (lt) => (lt < at + 0.4 ? 0 : o.n(lt)), color: o.cellColor, op: o.op });
    if (o.label) this.follow((lt) => { const s = lt < at + 0.4 ? null : o.label(lt); return s == null ? null : { text: s, x: o.x + W / 2, y: o.y + H + 10 }; },
      { size: o.lsize ?? 30, font: 'latin', weight: 700, color: o.lcolor || c, w: W + 200 });
    return { W, H, g };
  };

  /**
   * place3d(L, fn, origin) — per-layer 3D transform: fn(lt) → { x, y, z, ry, rx, s, op } | null. Own perspective per layer.
   */
  B.place3d = function (L, fn, origin, persp = 1400) {
    L.wrap.style.transformOrigin = `${origin[0]}px ${origin[1]}px`;
    this.tick((lt) => {
      const v = fn(lt);
      if (!v) { L.wrap.style.opacity = '0'; return; }
      L.wrap.style.opacity = clamp(v.op ?? 1).toFixed(3);
      L.wrap.style.transform = `perspective(${persp}px) translate3d(${(v.x ?? 0).toFixed(1)}px, ${(v.y ?? 0).toFixed(1)}px, ${(v.z ?? 0).toFixed(1)}px) ` +
        `rotateY(${(v.ry ?? 0).toFixed(2)}deg) rotateX(${(v.rx ?? 0).toFixed(2)}deg) scale(${(v.s ?? 1).toFixed(4)})`;
    });
    return L;
  };
})();
