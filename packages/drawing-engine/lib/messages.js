/* A message column whose rows shrink, fall or relabel over time (msgcol), a two-faced CSS-3D flip card (flip2), and a grid of
 * cells filled in order (cellgrid). All pure in lt. */
(function () {
  const { clamp, ease, Builder } = PV;
  const B = Builder.prototype;

  /** Chat roles → [colour, tag], the defaults of msgcol; o.roles adds or replaces roles. */
  PV.ROLE = {
    sys: ['blue', 'system'], user: ['green', 'user'], ai: ['purple', 'assistant'], use: ['orange', 'tool_use'], res: ['orange', 'tool_result'],
    sum: ['purple', 'summary'], mark: ['muted', 'boundary'], file: ['blue', 'file'], img: ['red', 'image'],
  };

  /**
   * msgcol(o) — rows of messages: a role tag on the left and a bar whose width follows lt.
   * o: { x, y, rowH (54), gap (12), tagW (190), n, size, roles, tagSize, labelW, row(i, lt) → null | { role, w, label, color, fill, op, dx, dy, tc,
   *   after (label sits right of the bar), font ('mono' for the label), size } }  Labels are left-aligned inside the bar.
   * Returns { Y(i) → top of row i, X0 → where bars start }.
   */
  B.msgcol = function (o) {
    const rowH = o.rowH ?? 54, gap = o.gap ?? 12, tagW = o.tagW ?? 190, X0 = o.x + tagW + 14, size = o.size ?? 24;
    const Y = (i) => o.y + i * (rowH + gap), ROLE = Object.assign({}, PV.ROLE, o.roles);
    for (let i = 0; i < o.n; i++) {
      const st = (lt) => o.row(i, lt);
      this.liveRough((lt, R) => {
        const r = st(lt);
        if (!r || (r.op ?? 1) <= 0.01) return null;
        const [c, ] = ROLE[r.role] || ['ink'], col = r.color || c, y = Y(i) + (r.dy || 0), dx = r.dx || 0, out = [];
        out.push(R.box(o.x + dx, y + 6, tagW, rowH - 12, { r: 10, fill: 'paper', color: col, sw: 2, seed: 400 + i * 3, rough: 0.6 }));
        if (r.w > 4) out.push(R.box(X0 + dx, y, Math.max(8, r.w), rowH, { r: 10, fill: r.fill || col + 'F', color: col, sw: 2.4, seed: 401 + i * 3, rough: 0.7 }));
        return out;
      }, { opacity: (lt) => { const r = st(lt); return r ? clamp(r.op ?? 1) : 0; } });
      this.follow((lt) => {
        const r = st(lt);
        if (!r) return null;
        const [c, tag] = ROLE[r.role] || ['ink', r.role];
        return { text: tag, x: o.x + (r.dx || 0) + tagW / 2, y: Y(i) + (r.dy || 0) + rowH / 2 - size * 0.62, opacity: clamp(r.op ?? 1), color: r.color || c };
      }, { size: o.tagSize ?? size, font: 'mono', weight: 700, w: tagW });
      const LW = o.labelW ?? 900;
      const el = this.follow((lt) => {
        const r = st(lt);
        if (!r || !r.label) return null;
        const left = X0 + (r.dx || 0) + (r.after ? Math.max(8, r.w) + 16 : 16), fs = r.size ?? size;
        return { text: r.font ? `<span style="font-family:var(--${r.font});font-size:${fs}px">${r.label}</span>` : r.label, x: left + LW / 2,
          y: Y(i) + (r.dy || 0) + rowH / 2 - size * 0.66, opacity: clamp(r.op ?? 1) * (r.after ? 1 : clamp((r.w - 30) / 40)), color: r.tc || 'ink' };
      }, { size, font: o.font || 'hand', weight: 700, w: LW });
      el.style.textAlign = 'left';
    }
    return { Y, X0 };
  };

  /**
   * flip2(cx, cy, o) — two layers (front, back) on one card that flips around Y (or X with o.axis 'x').
   * o.flip(lt) → 0 (front) .. 1 (back), o.op(lt) → overall opacity. Draw into the returned F / Bk builders. Needs P.host perspective (set here).
   */
  B.flip2 = function (cx, cy, o = {}) {
    this.host.style.perspective = (o.persp ?? 1600) + 'px';
    const F = this.layer(), Bk = this.layer(), ax = o.axis === 'x' ? 'rotateX' : 'rotateY';
    this.tick((lt) => {
      const f = clamp(o.flip ? o.flip(lt) : 0), a = f * 180;
      [F, Bk].forEach((L, i) => {
        L.wrap.style.transformOrigin = `${cx}px ${cy}px`;
        L.wrap.style.transform = `${ax}(${(i ? a - 180 : a).toFixed(1)}deg)`;
        L.wrap.style.backfaceVisibility = 'hidden';
        L.wrap.style.opacity = ((i ? f > 0.5 : f <= 0.5) ? (o.op ? clamp(o.op(lt)) : 1) : 0).toFixed(3);
      });
    });
    return { F, Bk };
  };

  /**
   * cellgrid(x, y, cols, rows, cell, o) — cols×rows cells, filled in order (one cell per unit of whatever is counted).
   * o.color(i, lt) → colour key | null (empty cell); o.at. Cells pop with a little bounce when they become filled.
   */
  B.cellgrid = function (x, y, cols, rows, cell, o = {}) {
    const n = cols * rows, at = o.at ?? 0, g = PV.s('g', {}, this.svg), cells = [];
    for (let i = 0; i < n; i++) {
      const X = x + (i % cols) * cell, Y = y + Math.floor(i / cols) * cell;
      const d = PV.gen.rectangle(X + 3, Y + 3, cell - 6, cell - 6, { seed: 700 + i, roughness: 0.8, bowing: 0.5, fill: '#000', fillStyle: 'solid', preserveVertices: true });
      const cg = PV.s('g', {}, g), fills = [], strokes = [];
      for (const set of d.sets) {
        const el = PV.s('path', { d: PV.gen.opsToPath(set, 2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cg);
        if (set.type === 'fillPath') { el.setAttribute('stroke', 'none'); fills.push(el); } else { el.setAttribute('fill', 'none'); strokes.push(el); }
      }
      cells.push({ fills, strokes, X, Y, key: '' });
    }
    this.tick((lt) => {
      const show = ease.out(clamp((lt - at) / 0.6));
      g.style.opacity = show.toFixed(3);
      cells.forEach((c, i) => {
        const k = o.color ? o.color(i, lt) : null, key = k || '-';
        if (key === c.key) return;
        c.key = key;
        c.fills.forEach((el) => el.setAttribute('fill', k ? PV.col(k + 'F') : 'none'));
        c.strokes.forEach((el) => { el.setAttribute('stroke', k ? PV.col(k) : PV.col('faint')); el.setAttribute('stroke-width', k ? 2 : 1.4); });
      });
    });
    return { cx: (i) => x + (i % cols) * cell + cell / 2, cy: (i) => y + Math.floor(i / cols) * cell + cell / 2 };
  };
})();
