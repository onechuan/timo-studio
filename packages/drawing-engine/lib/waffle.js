/* A waffle of little people (waffle): a cols×rows grid of figures that pop in and re-colour as a function of lt — share of a
 * population at a glance. */
(function () {
  const { s, gen, clamp, ease, Builder } = PV;

  /**
   * waffle(x, y, cols, rows, cell, o) — o: { at, stagger, state(i, lt) → [fromColor, toColor, k] }
   * Each cell is a tiny hand-drawn person (head + shoulders). Returns { cx(i), cy(i) }.
   */
  Builder.prototype.waffle = function (x, y, cols, rows, cell, o = {}) {
    const at = o.at ?? 0, st = o.stagger ?? 0.012, n = cols * rows;
    const g = s('g', {}, this.svg);
    const cells = [];
    const cx = (i) => x + (i % cols) * cell + cell / 2, cy = (i) => y + Math.floor(i / cols) * cell + cell / 2;
    for (let i = 0; i < n; i++) {
      const u = cell * 0.36, X = cx(i), Y = cy(i);
      const opt = { seed: 900 + i, roughness: 0.7, bowing: 0.6, strokeWidth: 1.8, stroke: '#000', fill: '#000', fillStyle: 'solid', preserveVertices: true };
      const head = gen.circle(X, Y - u * 0.55, u * 0.95, opt);
      const body = gen.path(`M${X - u * 0.95} ${Y + u * 1.05} Q${X - u * 0.9} ${Y + u * 0.05} ${X} ${Y + u * 0.08} Q${X + u * 0.9} ${Y + u * 0.05} ${X + u * 0.95} ${Y + u * 1.05} Z`, opt);
      const cg = s('g', {}, g);
      const fills = [], strokes = [];
      for (const d of [head, body]) for (const set of d.sets) {
        const el = s('path', { d: gen.opsToPath(set, 2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cg);
        if (set.type === 'fillPath') { el.setAttribute('stroke', 'none'); fills.push(el); }
        else { el.setAttribute('fill', 'none'); el.setAttribute('stroke-width', 1.8); strokes.push(el); }
      }
      cells.push({ cg, fills, strokes, X, Y, key: '' });
    }
    this.tick((lt) => {
      cells.forEach((c, i) => {
        const k = ease.back(clamp((lt - at - i * st) / 0.35));
        const [a, b, m] = o.state ? o.state(i, lt) : ['faint', 'faint', 0];
        const key = k.toFixed(3) + a + b + m.toFixed(3);
        if (key === c.key) return;
        c.key = key;
        c.cg.style.opacity = clamp(k * 2).toFixed(3);
        c.cg.setAttribute('transform', `translate(${c.X} ${c.Y}) scale(${Math.max(0.001, k).toFixed(3)}) translate(${-c.X} ${-c.Y})`);
        const F = (c) => (c === 'muted' || c === 'soft' ? 'faint' : c + 'F');
        const ink = PV.mix(a, b, m), fill = PV.mix(F(a), F(b), m);
        c.fills.forEach((el) => el.setAttribute('fill', fill));
        c.strokes.forEach((el) => el.setAttribute('stroke', ink));
      });
    });
    return { cx, cy, g };
  };
})();
