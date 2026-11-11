/* Flows: a node graph with a state packet travelling its edges (graph), an envelope-like packet to move with P.move (packet), a
 * railway switch for a branch that is either taken or not (switcher), a CSS-3D stack of cards that land one by one (ckstack), and
 * column helpers for code cards (PV.hlx, PV.colX). All pure in lt. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;

  /**
   * graph(o) — nodes: [{ id, x, y, w, h, label, color, term (START / END pill), at }], edges: [{ a, b, cond (dashed), bend, d, color, label, lx, ly, at, sw }].
   * o: { at, stagger, size, L (builder to draw into, default this) }. Nodes appear in order, each edge after both ends.
   * Returns { N, E, edge(a, b) → { d, R }, run(visits, ro) }.
   *   run(visits: [[id, t], …], ro: { travel, color, ring, hide: t, skip: [edgeKeys drawn but not animated] }) — a state packet arrives at node id at t,
   *   travelling along the edge from the previous node during [t − travel, t]; while it sits, the node gets a ring.
   */
  B.graph = function (o) {
    const G = o.L || this, at = o.at ?? 0, st = o.stagger ?? 0.3, size = o.size ?? 32;
    const N = {};
    o.nodes.forEach((n, i) => {
      const q = Object.assign({ w: n.term ? 130 : 190, h: n.term ? 60 : 80, color: n.term ? 'soft' : 'blue', t: n.at ?? at + i * st }, n);
      N[n.id] = q;
      G.box(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h, { r: q.h / 2, fill: q.color + 'F', color: q.color, sw: q.term ? 2.4 : 3, at: q.t, dur: 0.4, texture: false });
      const fs = q.term ? 26 : q.size ?? size;
      G.text(q.label ?? q.id, { x: q.x, y: q.y - fs * 0.72, w: q.w + 60, align: 'c', size: fs, font: 'mono', weight: 700, color: q.color, at: q.t + 0.15, mode: 'fade', raw: true });
    });
    const border = (A, dx, dy) => { const L = Math.hypot(dx, dy) || 1; return (A.w / 2) * Math.abs(dx / L) + (A.h / 2) * Math.abs(dy / L) + 8; };
    const E = {};
    (o.edges || []).forEach((e) => {
      const A = N[e.a], Bn = N[e.b], t = e.at ?? Math.max(A.t, Bn.t) + 0.25;
      let d = e.d;
      if (!d) {
        const dx = Bn.x - A.x, dy = Bn.y - A.y, L = Math.hypot(dx, dy) || 1, ra = border(A, dx, dy), rb = border(Bn, dx, dy) + 4;
        const x1 = A.x + (dx / L) * ra, y1 = A.y + (dy / L) * ra, x2 = Bn.x - (dx / L) * rb, y2 = Bn.y - (dy / L) * rb, bend = e.bend || 0;
        d = bend ? `M${x1} ${y1} Q${(x1 + x2) / 2 - (y2 - y1) * bend} ${(y1 + y2) / 2 + (x2 - x1) * bend} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
      }
      const h = G.arrow(0, 0, 0, 0, { d, color: e.color || (e.cond ? 'orange' : 'soft'), sw: e.sw ?? 2.8, head: 14, at: t, dur: 0.4, dashed: !!e.cond });
      if (e.label) G.text(e.label, { x: e.lx, y: e.ly, w: 260, align: 'c', size: e.size ?? 26, color: e.color || (e.cond ? 'orange' : 'muted'), at: t + 0.2, mode: 'fade' });
      E[e.a + '>' + e.b] = { d, R: this.pathAt(d), h };
    });
    const self = this;
    return {
      N, E,
      run(visits, ro = {}) {
        const tr = ro.travel ?? 0.8, c = ro.color || 'orange';
        const pos = (lt) => {
          if (lt < visits[0][1] || (ro.hide != null && lt > ro.hide)) return null;
          let i = 0;
          while (i + 1 < visits.length && lt >= visits[i + 1][1] - tr) i++;
          const [id, t] = visits[i], nx = visits[i + 1];
          const A = N[id];
          if (nx && lt >= nx[1] - tr) {
            const e = E[id + '>' + nx[0]], u = ease.inOut(clamp((lt - (nx[1] - tr)) / tr));
            if (e) { const p = e.R.at(u); return { x: p.x, y: p.y, on: null }; }
            const Bn = N[nx[0]];
            return { x: lerp(A.x, Bn.x, u), y: lerp(A.y, Bn.y, u), on: null };
          }
          const prev = i > 0 ? E[visits[i - 1][0] + '>' + id] : null;
          const p = prev ? prev.R.at(1) : { x: A.x, y: A.y - A.h / 2 - 6 };
          return { x: p.x, y: p.y, on: lt - t < 0 ? null : A };
        };
        self.liveRough((lt, R) => {
          const p = pos(lt);
          if (!p) return null;
          const out = [];
          if (p.on && ro.ring !== false) out.push(R.box(p.on.x - p.on.w / 2 - 12, p.on.y - p.on.h / 2 - 12, p.on.w + 24, p.on.h + 24, { r: p.on.h / 2 + 12, color: ro.ring || c, sw: 4, seed: 9 }));
          out.push(R.box(p.x - 26, p.y - 19, 52, 38, { r: 8, fill: 'yellow', color: c, sw: 2.6, seed: 5 }));
          return out;
        });
        return pos;
      },
    };
  };

  /**
   * packet(x, y, w, label, o) — an envelope-like packet on its own layer (drawn at x, y; move it with P.move(L, …)).
   * o: { at, color, size, h, sub (small caption above) }. Returns the layer.
   */
  B.packet = function (x, y, w, label, o = {}) {
    const L = this.layer(), c = o.color || 'orange', hh = o.h ?? 60, at = o.at ?? 0, size = o.size ?? 26;
    L.box(x, y, w, hh, { r: 8, fill: 'paper', color: c, sw: 2.6, at, dur: 0.01, texture: false });
    L.path(`M${x + 4} ${y + 4} L${x + w / 2} ${y + hh * 0.42} L${x + w - 4} ${y + 4}`, { color: c, sw: 1.8, at, dur: 0.01, rough: 0.5 });
    L.text(label, { x: x + w / 2, y: y + hh - size * 1.45, w: w + 40, align: 'c', size, font: 'mono', weight: 700, color: c, at, mode: 'fade', dur: 0.01, raw: true });
    if (o.sub) L.text(o.sub, { x: x + w / 2, y: y - 38, w: w + 80, align: 'c', size: 24, color: 'muted', at, mode: 'fade', dur: 0.01 });
    return L;
  };

  /**
   * switcher(x, y, o) — a railway switch: track comes in from the left to (x, y); branch A bends up to (ax, ay), branch B goes on to (bx, by).
   * o: { at, ax, ay, bx, by, k(lt) → 0 (set to A) … 1 (set to B), colorA, colorB }. The movable blade turns with k; the live branch is inked in colour.
   */
  B.switcher = function (x, y, o) {
    const at = o.at ?? 0, cA = o.colorA || 'orange', cB = o.colorB || 'soft';
    const dA = `M${x} ${y} Q${x + (o.ax - x) * 0.55} ${y} ${o.ax} ${o.ay}`, dB = `M${x} ${y} L${o.bx} ${o.by}`;
    this.path(dA, { color: 'faint', sw: 9, at, dur: 0.5 });
    this.path(dB, { color: 'faint', sw: 9, at: at + 0.1, dur: 0.5 });
    this.liveRough((lt, R) => {
      if (lt < at + 0.4) return null;
      const k = clamp(o.k(lt)), out = [];
      if (k < 0.5) out.push(R.path(dA, { color: cA, sw: 5, seed: 3 })); else out.push(R.path(dB, { color: cB, sw: 5, seed: 4 }));
      const ang = lerp(-38, 0, k) * Math.PI / 180, bl = 90;
      out.push(R.line(x - 20, y, x - 20 + Math.cos(ang) * bl, y + Math.sin(ang) * bl, { color: 'ink', sw: 7, seed: 6 }));
      out.push(R.circle(x - 20, y, 26, { fill: 'ink', color: 'ink', sw: 2, seed: 7 }));
      return out;
    });
  };

  /**
   * ckstack(o) — cards stacked in depth (CSS 3D), say saved versions. o: { cx, cy, w, h, gap, n, t(i) → time card i lands, label(i), sub(i), color(i),
   *   tilt(lt) → { rx, rz }, persp, size, glow(i, lt) → bool (thick ring), red(i, lt) → bool }
   * Card i sits at translateZ(i * gap) and drops in from above. Returns { S, L: [layers] }.
   */
  B.ckstack = function (o) {
    const { cx, cy, w, h: hh } = o, gap = o.gap ?? 40, size = o.size ?? 40;
    if (o.persp !== false) this.host.style.perspective = (o.persp ?? 1700) + 'px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${cx}px ${cy}px`;
    const L = [];
    for (let i = 0; i < o.n; i++) {
      const C = S.layer(), c = o.color ? o.color(i) : 'blue', t = o.t(i);
      C.box(cx - w / 2, cy - hh / 2, w, hh, { r: 16, fill: c + 'F', color: c, sw: 3, at: t - 0.6, dur: 0.01, texture: false });
      // labels sit on the card's bottom strip: the card above (higher z) covers the top part of this one
      const ly = cy + hh / 2 - size * 1.45;
      C.text(o.label(i), { x: cx - w / 2 + 26, y: ly, size, font: 'mono', weight: 700, color: c, at: t - 0.6, mode: 'fade', dur: 0.01, raw: true });
      if (o.sub) C.text(o.sub(i), { x: cx - w / 2 + (o.subX ?? 300), y: ly + size * 0.12, size: size * 0.8, color: 'soft', at: t - 0.6, mode: 'fade', dur: 0.01 });
      if (o.glow) C.liveRough((lt, R) => (o.glow(i, lt) ? [R.box(cx - w / 2 - 10, cy - hh / 2 - 10, w + 20, hh + 20, { r: 22, color: 'orange', sw: 6, seed: 40 + i })] : null));
      if (o.red) C.liveRough((lt, R) => (o.red(i, lt) ? [R.box(cx - w / 2, cy - hh / 2, w, hh, { r: 16, fill: 'redF', color: 'red', sw: 3.4, seed: 60 + i })] : null));
      L.push(C);
    }
    this.tick((lt) => {
      const r = o.tilt ? o.tilt(lt) : { rx: 52, rz: -24 };
      S.wrap.style.transform = `rotateX(${r.rx.toFixed(2)}deg) rotateZ(${r.rz.toFixed(2)}deg)`;
      L.forEach((C, i) => {
        const k = ease.out(clamp((lt - (o.t(i) - 0.55)) / 0.55));
        C.wrap.style.transform = `translateZ(${(i * gap + (1 - k) * 320).toFixed(1)}px)`;
        C.wrap.style.opacity = (k * (o.op ? o.op(i, lt) : 1)).toFixed(3);
      });
    });
    return { S, L };
  };
})();

/* Code-card helpers (JetBrains Mono: glyph width measured at 0.6 em in the render browser).
 * PV.hlx(code, row, t, c0, n, o) highlights n chars from column c0; PV.colX(code, size, col) → x of a column. */
PV.hlx = (code, row, t, c0, n, o = {}) => code.hl(row, t, Object.assign({}, o, { c0, n }));
PV.colX = (code, size, col) => code.lineX + col * size * 0.6;
