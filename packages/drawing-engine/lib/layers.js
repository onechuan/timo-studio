/* Layers and links: a network of labelled nodes that grows over time (netgraph), a CSS-3D stack of plates with a screen projector
 * (layers3d), a document card whose rows are added, struck out or highlighted (fcard) and a two-sided card that turns over (flip).
 * All pure in lt. */
(function () {
  const { clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;
  /**
   * netgraph(o) — nodes: [{ id, x, y (0..1 inside the box), born (the wave it joins in, 0, 1, …) }], edges: [{ a, b, born }].
   * o: { x, y, w, h, nodes, edges, upto (waves shown, default all), t(k) → time wave k lands, size, color(node) → key,
   *      hl(id, lt) → colour key | null (ring around a node), ehl(edge, lt) → colour key | null, hide: [ids] }
   * Returns { E, N (layers), pos(id) → [cx, cy], nodes, edges }.
   */
  B.netgraph = function (o) {
    const D = { NODES: o.nodes, EDGES: o.edges }, size = o.size ?? 24, upto = o.upto ?? Infinity, hh = size * 1.6;
    const nodes = D.NODES.filter((n) => n.born < upto && !(o.hide || []).includes(n.id));
    const ids = new Set(nodes.map((n) => n.id));
    const edges = D.EDGES.filter((e) => e.born < upto && ids.has(e.a) && ids.has(e.b));
    const P = {};
    nodes.forEach((n) => { P[n.id] = [o.x + n.x * o.w, o.y + n.y * o.h]; });
    const E = this.layer(), N = this.layer();
    const bt = (n) => o.t(n.born) + (nodes.filter((m) => m.born === n.born).indexOf(n) * 0.04);
    edges.forEach((e, i) => {
      const [x1, y1] = P[e.a], [x2, y2] = P[e.b];
      E.line(x1, y1, x2, y2, { color: 'faint', sw: 1.7, single: true, rough: 0.6, at: o.t(e.born) + 0.25 + (i % 12) * 0.03, dur: 0.35 });
    });
    nodes.forEach((n) => {
      const [cx, cy] = P[n.id], w = PV.tw(n.id, size) + 22, c = o.color ? o.color(n) : 'blue';
      N.box(cx - w / 2, cy - hh / 2, w, hh, { r: 10, fill: 'paper', color: c, sw: 2.2, rough: 0.7, texture: false, at: bt(n), dur: 0.3 });
      N.text(n.id, { x: cx, y: cy - size * 0.72, w: w + 20, align: 'c', size, color: c === 'faint' ? 'muted' : 'ink', at: bt(n) + 0.1, mode: 'fade', dur: 0.25, raw: true });
    });
    if (o.hl || o.ehl) N.liveRough((lt, R) => {
      const out = [];
      if (o.ehl) edges.forEach((e, i) => {
        const c = o.ehl(e, lt);
        if (c) { const [x1, y1] = P[e.a], [x2, y2] = P[e.b]; out.push(R.line(x1, y1, x2, y2, { color: c, sw: 3, rough: 0.5, single: true, seed: 300 + i })); }
      });
      if (o.hl) nodes.forEach((n, i) => {
        const c = o.hl(n.id, lt);
        if (!c) return;
        const [cx, cy] = P[n.id], w = PV.tw(n.id, size) + 22;
        out.push(R.box(cx - w / 2 - 5, cy - hh / 2 - 5, w + 10, hh + 10, { r: 12, fill: PV.C[c + 'F'] ? c + 'F' : undefined, color: c, sw: 3.4, rough: 0.6, seed: 500 + i }));
      });
      return out;
    });
    // liveRough draws into N.svg after the node boxes → rings sit above boxes, below labels (N.html)
    return { E, N, pos: (id) => P[id], nodes, edges };
  };

  /**
   * layers3d(o) — three (or n) plates stacked in depth with CSS 3D; plate 0 at the bottom.
   * o: { cx, cy, w, h, gap, persp, plates: [{ color, at, draw(L, x, y, w, h) }], tilt(lt) → { rx, rz } }
   * Returns { L: [layer…], proj(i, px, py, lt) → [sx, sy] } — proj maps a point on plate i (page coords before 3D) to the screen.
   */
  B.layers3d = function (o) {
    const n = o.plates.length, gap = o.gap ?? 150, w = o.w ?? 700, hh = o.h ?? 320, persp = o.persp ?? 1800;
    const x = o.cx - w / 2, y = o.cy - hh / 2;
    this.host.style.perspective = persp + 'px';
    this.host.style.perspectiveOrigin = '960px 540px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${o.cx}px ${o.cy}px`;
    const z = (i, lt) => (i - (n - 1) / 2) * gap + (1 - ease.out(clamp((lt - o.plates[i].at) / 0.7))) * 260;
    const Ls = o.plates.map((pl) => {
      const L = S.layer();
      L.box(x, y, w, hh, { r: 26, fill: pl.color + 'F', color: pl.color, sw: 3.2, at: pl.at, dur: 0.4, texture: false, rough: 0.7 });
      if (pl.draw) pl.draw(L, x, y, w, hh);
      return L;
    });
    const tilt = (lt) => (o.tilt ? o.tilt(lt) : { rx: 58, rz: -24 });
    this.tick((lt) => {
      const t = tilt(lt);
      S.wrap.style.transform = `rotateX(${t.rx.toFixed(2)}deg) rotateZ(${t.rz.toFixed(2)}deg)`;
      Ls.forEach((L, i) => {
        L.wrap.style.transform = `translateZ(${z(i, lt).toFixed(1)}px)`;
        L.wrap.style.opacity = clamp((lt - o.plates[i].at) / 0.4).toFixed(3);
      });
    });
    const proj = (i, px, py, lt) => {
      const t = tilt(lt), a = (t.rz * Math.PI) / 180, b = (t.rx * Math.PI) / 180;
      let X = px - o.cx, Y = py - o.cy, Z = z(i, lt);
      const x1 = X * Math.cos(a) - Y * Math.sin(a), y1 = X * Math.sin(a) + Y * Math.cos(a);
      const y2 = y1 * Math.cos(b) - Z * Math.sin(b), z2 = y1 * Math.sin(b) + Z * Math.cos(b);
      const sx = o.cx + x1, sy = o.cy + y2, k = persp / (persp - z2);
      return [960 + (sx - 960) * k, 540 + (sy - 540) * k];
    };
    return { L: Ls, proj };
  };

  /**
   * fcard(x, y, w, name, rows, o) — a markdown file card: mono file name on a tab + rows of handwriting.
   * rows: [{ text, at, color, size, add (green "+" gutter), strike: t, mark: t }]; o: { at, h, color, rowH, size }
   */
  B.fcard = function (x, y, w, name, rows, o = {}) {
    const at = o.at ?? 0, c = o.color || 'soft', size = o.size ?? 28, rowH = o.rowH ?? size * 1.6;
    const hh = o.h ?? 74 + rows.length * rowH + 16;
    this.box(x, y, w, hh, { r: 14, fill: o.fill || 'paper', color: c, sw: 2.4, at, dur: 0.5, texture: false });
    this.text(name, { x: x + 22, y: y + 12, size: o.nsize ?? 28, font: 'mono', weight: 700, color: o.ncolor || c, at: at + 0.2, mode: 'fade', dur: 0.25, raw: true });
    this.line(x + 12, y + 60, x + w - 12, y + 60, { color: 'faint', sw: 2, at: at + 0.25, dur: 0.3 });
    const rowY = (i) => y + 74 + i * rowH;
    rows.forEach((r, i) => {
      const ry = rowY(i), s = r.size ?? size, ta = r.at ?? at + 0.4 + i * 0.12;
      if (r.add) {
        this.box(x + 8, ry - 4, w - 16, rowH - 2, { r: 8, fill: 'greenF', color: 'greenF', sw: 1, at: ta, dur: 0.25, texture: false });
        this.text('+', { x: x + 16, y: ry + (rowH - s * 1.45) / 2 - 4, size: s, font: 'mono', weight: 700, color: 'green', at: ta, mode: 'fade', dur: 0.2 });
      }
      const t = this.text(r.text, { x: x + 44, y: ry + (rowH - s * 1.45) / 2 - 4, size: s, color: r.color || (r.add ? 'green' : 'soft'), at: ta + 0.05, cps: r.cps ?? 30, mode: r.mode, raw: r.raw });
      if (r.strike != null) this.line(x + 40, ry + rowH / 2 - 4, x + 44 + (r.sw ?? PV.tw(r.text, s)) + 6, ry + rowH / 2 - 6, { color: 'red', sw: 3, at: r.strike, dur: 0.35 });
      if (r.mark != null) this.mark(x + 38, ry, (r.sw ?? PV.tw(r.text, s)) + 14, rowH - 6, { at: r.mark, color: r.markColor });
      r.el = t;
    });
    return { h: hh, rowY };
  };

  /**
   * flip(cx, cy, w, h, front, back, o) — a card that turns over (rotateY) at o.at: front / back = { text, color, size, font }.
   */
  B.flip = function (cx, cy, w, hh, front, back, o = {}) {
    const faces = [front, back].map((f, k) => {
      const L = this.layer(), c = f.color || 'soft', size = f.size ?? 40;
      L.box(cx - w / 2, cy - hh / 2, w, hh, { r: 18, fill: c + 'F', color: c, sw: 2.8, at: o.show ?? 0, dur: 0.5, texture: false });
      L.text(f.text, { x: cx, y: cy - size * 0.72 * (f.lines ?? 1), w: w - 20, align: 'c', size, weight: 700, font: f.font || 'hand', color: c, at: (o.show ?? 0) + 0.2, mode: 'fade', dur: 0.3, raw: f.raw, lh: 1.45 });
      L.wrap.style.transformOrigin = `${cx}px ${cy}px`;
      L.wrap.style.backfaceVisibility = 'hidden';
      return L;
    });
    this.tick((lt) => {
      const a = 180 * ease.inOut(clamp((lt - (o.at ?? 1e9)) / (o.dur ?? 0.8)));
      faces[0].wrap.style.transform = `perspective(1200px) rotateY(${a.toFixed(2)}deg)`;
      faces[1].wrap.style.transform = `perspective(1200px) rotateY(${(a - 180).toFixed(2)}deg)`;
      faces[0].wrap.style.visibility = a < 90 ? 'visible' : 'hidden';
      faces[1].wrap.style.visibility = a >= 90 ? 'visible' : 'hidden';
    });
    return faces;
  };
})();
