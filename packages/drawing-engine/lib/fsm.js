/* States and plots: a hand-drawn state machine with a walking cursor (fsm), and a line plot revealed by a moving x (plot). Pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;

  /**
   * fsm(nodes, edges, o) — nodes: [{ id, x, y, w, label, color, font }] (x, y = centre), edges: [[fromId, toId, { bend, label }]].
   * o: { at, stagger, h, size }. Nodes are drawn in list order, each edge right after its target node.
   * Returns { N(id) → node, cursor(path, u(lt), o) } — the cursor slides along the node path (u = fractional index) and rings the node it sits on.
   */
  B.fsm = function (nodes, edges, o = {}) {
    const at = o.at ?? 0, st = o.stagger ?? 0.35, hh = o.h ?? 74, size = o.size ?? 34;
    const N = {};
    nodes.forEach((n, i) => { N[n.id] = Object.assign({ w: 150, color: 'blue', t: at + i * st }, n); });
    nodes.forEach((n0) => {
      const n = N[n0.id];
      this.box(n.x - n.w / 2, n.y - hh / 2, n.w, hh, { r: hh / 2, fill: n.color + 'F', color: n.color, sw: 2.6, at: n.t, dur: 0.4, texture: false });
      this.text(n.label, { x: n.x, y: n.y - size * 0.7, w: n.w + 40, align: 'c', size, font: n.font || 'mono', weight: 700, color: n.color, at: n.t + 0.15, mode: 'fade', raw: true });
    });
    edges.forEach(([a, b, eo = {}]) => {
      const A = N[a], Bn = N[b], t = Math.max(A.t, Bn.t) + 0.2;
      const dx = Bn.x - A.x, dy = Bn.y - A.y, L = Math.hypot(dx, dy) || 1;
      const ra = (A.w / 2) * Math.abs(dx / L) + (hh / 2) * Math.abs(dy / L) + 8, rb = (Bn.w / 2) * Math.abs(dx / L) + (hh / 2) * Math.abs(dy / L) + 10;
      this.arrow(A.x + (dx / L) * ra, A.y + (dy / L) * ra, Bn.x - (dx / L) * rb, Bn.y - (dy / L) * rb, { color: eo.color || 'soft', sw: 2.6, head: 12, at: t, dur: 0.3, bend: eo.bend || 0 });
      if (eo.label) this.text(eo.label, { x: (A.x + Bn.x) / 2 + (eo.lx ?? 0), y: (A.y + Bn.y) / 2 + (eo.ly ?? -44), w: 240, align: 'c', size: 24, color: 'muted', at: t + 0.2, mode: 'fade' });
    });
    const self = this;
    return {
      N,
      /** path: [id…]; u(lt) → fractional index into path, or null to hide. */
      cursor(path, u, co = {}) {
        self.liveRough((lt, R) => {
          const v = u(lt);
          if (v == null) return null;
          const i = clamp(Math.floor(v), 0, path.length - 1), f = v - i, A = N[path[i]], Bn = N[path[Math.min(i + 1, path.length - 1)]];
          const k = ease.inOut(clamp((f - 0.55) / 0.45));   // sit on the node, then slide
          const x = lerp(A.x, Bn.x, k), y = lerp(A.y, Bn.y, k) - hh / 2 - 26;
          const out = [R.path(`M${x - 16} ${y - 20} L${x + 16} ${y - 20} L${x} ${y} Z`, { fill: 'orange', color: 'orange', sw: 2, seed: 7 })];
          if (k < 0.05) out.push(R.box(A.x - A.w / 2 - 10, A.y - hh / 2 - 10, A.w + 20, hh + 20, { r: hh / 2 + 10, color: co.color || 'orange', sw: 3.6, seed: 11 + i }));
          return out;
        });
      },
    };
  };

  /**
   * plot(o) — axes + a polyline revealed up to a moving x. o: { x, y, w, h, xs: [min, max], ys: [min, max], pts: [[xv, yv]],
   *   reach(lt) → x value reached, color, xTicks: [[v, text]], yTicks: [[v, text]], at, xLabel, yLabel, dot: true, fill }
   * Returns { X(v), Y(v) }.
   */
  B.plot = function (o) {
    const at = o.at ?? 0, c = o.color || 'blue';
    const X = (v) => o.x + ((v - o.xs[0]) / (o.xs[1] - o.xs[0])) * o.w, Y = (v) => o.y + o.h - ((v - o.ys[0]) / (o.ys[1] - o.ys[0])) * o.h;
    if (!o.noAxes) {
      this.arrow(o.x, o.y + o.h, o.x + o.w + 40, o.y + o.h, { color: 'soft', sw: 2.4, head: 12, at, dur: 0.5 });
      this.arrow(o.x, o.y + o.h, o.x, o.y - 30, { color: 'soft', sw: 2.4, head: 12, at, dur: 0.5 });
      for (const [v, t] of o.xTicks || []) this.text(t, { x: X(v), y: o.y + o.h + 12, w: 140, align: 'c', size: 28, color: 'muted', at: at + 0.3, mode: 'fade' });
      for (const [v, t] of o.yTicks || []) {
        this.text(t, { x: o.x - 16, y: Y(v) - 20, w: 120, align: 'r', size: 28, color: 'muted', at: at + 0.3, mode: 'fade' });
        this.line(o.x - 6, Y(v), o.x + o.w, Y(v), { color: 'faint', sw: 1.2, at: at + 0.3, dur: 0.4, rough: 0.3 });
      }
      if (o.xLabel) this.text(o.xLabel, { x: o.x + o.w - 260, y: o.y + o.h + 50, w: 300, align: 'r', size: 28, color: 'soft', at: at + 0.4, mode: 'fade' });
      if (o.yLabel) this.text(o.yLabel, { x: o.x - 20, y: o.y - 84, size: 28, color: 'soft', at: at + 0.4, mode: 'fade' });
    }
    this.liveRough((lt, R) => {
      const r = o.reach(lt);
      if (r == null || r <= o.pts[0][0]) return null;
      const P = [[X(o.pts[0][0]), Y(o.pts[0][1])]];
      for (let i = 1; i < o.pts.length; i++) {
        const [a, av] = o.pts[i - 1], [b, bv] = o.pts[i];
        if (r >= b) P.push([X(b), Y(bv)]);
        else { if (r > a) { const k = (r - a) / (b - a); P.push([X(r), Y(av + (bv - av) * k)]); } break; }
      }
      const d = 'M' + P.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
      const out = [R.path(d, { color: c, sw: 4.2, rough: 0.5, seed: 21 })];
      if (o.dot !== false) o.pts.forEach(([xv, yv], i) => { if (r >= xv) out.push(R.circle(X(xv), Y(yv), 20, { fill: c, color: c, sw: 2, seed: 30 + i })); });
      return out;
    });
    return { X, Y };
  };
})();
