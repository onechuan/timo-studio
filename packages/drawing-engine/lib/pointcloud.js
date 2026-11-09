/* Points and pieces: a hand-projected 3D point cloud (space3d), a text whose characters are coloured by piece as cut marks move
 * through it (chunkText), and stations on two lanes joined by arrows (lanes). All pure in lt. */
(function () {
  const { h, col, clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;
  const FILLS = ['blueF', 'orangeF', 'greenF', 'purpleF', 'redF', 'yellow', 'faint'];
  PV.CHUNKF = FILLS;

  /**
   * space3d(o) — a 3D point cloud drawn in perspective. o: { cx, cy, R (px per unit), f (focal, units), pts: [{ p: [x, y, z], color, label, r }],
   *   at(i) → appear time, rot(lt) → { ay, ax } (radians), box: t (wire cube appears), labelAt(i) → t | null, size (label px),
   *   hi(i, lt) → 0..1 (ring highlight), op(i, lt) → opacity }
   * Returns { proj(p, lt) → { x, y, s } }.
   */
  B.space3d = function (o) {
    const R = o.R ?? 300, f = o.f ?? 4;
    const proj = (p, lt) => {
      const { ay = 0, ax = 0 } = o.rot ? o.rot(lt) : {};
      let [x, y, z] = p;
      [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
      [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
      const s = f / (f + z);
      return { x: o.cx + x * R * s, y: o.cy - y * R * s, s, z };
    };
    // floor grid on the plane y = -E (reads as depth without a tall wire cube)
    const E = o.E ?? 1.05, FY = o.floorY ?? -E, edges = [];
    for (let k = 0; k <= 4; k++) { const v = -E + (k / 4) * 2 * E; edges.push([[v, FY, -E], [v, FY, E]], [[-E, FY, v], [E, FY, v]]); }
    const pk = (lt, i) => ease.back(clamp((lt - o.at(i)) / 0.4));
    this.liveRough((lt, Rr) => {
      const out = [];
      if (o.box != null && lt >= o.box) {
        const k = clamp((lt - o.box) / 0.6);
        edges.forEach(([a, b], i) => {
          const A = proj(a, lt), Bp = proj(b, lt);
          out.push(Rr.line(A.x, A.y, lerp(A.x, Bp.x, k), lerp(A.y, Bp.y, k), { color: 'faint', sw: 1.8, rough: 0.4, seed: 300 + i }));
        });
      }
      const order = o.pts.map((p, i) => [proj(p.p, lt), i]).sort((a, b) => b[0].z - a[0].z);
      for (const [q, i] of order) {
        const k = pk(lt, i), op = o.op ? o.op(i, lt) : 1;
        if (k <= 0 || op <= 0.02) continue;
        const pt = o.pts[i], c = pt.color || 'blue', d = (pt.r ?? 30) * q.s * k;
        out.push(Rr.circle(q.x, q.y, d, { fill: c + (op < 0.6 ? 'F' : ''), color: c, sw: 2.2, seed: 400 + i, rough: 0.5 }));
        const hk = o.hi ? o.hi(i, lt) : 0;
        if (hk > 0.01) out.push(Rr.circle(q.x, q.y, d + 26 * hk, { color: pt.hic || 'red', sw: 3.2, seed: 500 + i, rough: 0.6 }));
      }
      return out;
    });
    o.pts.forEach((pt, i) => {
      if (!pt.label) return;
      this.follow((lt) => {
        const t = o.labelAt ? o.labelAt(i) : o.at(i) + 0.2;
        if (t == null || lt < t) return null;
        const q = proj(pt.p, lt), op = (o.op ? o.op(i, lt) : 1) * clamp((lt - t) / 0.4);
        return { text: pt.label, x: q.x + (pt.dx ?? 0), y: q.y + (pt.dy ?? 22), opacity: op };
      }, { size: pt.size ?? o.size ?? 26, weight: 700, color: pt.lc || pt.color || 'ink', w: 340 });
    });
    return { proj };
  };

  /**
   * chunkText(x, y, w, o) — the document as one span per character (white-space: pre-wrap; '\n' shows as a muted ↵).
   * o: { text, ends (char offsets where each token ends), size, lh, at, cuts(lt) → { at: [char offsets], k: 0..1 appear } , tokLines: true (alternating token underline) }
   * Returns { spans, pos(c) → { x, y } (left/top of char c, page coords), lh }.
   */
  B.chunkText = function (x, y, w, o) {
    const size = o.size ?? 30, lh = size * (o.lh ?? 1.6), at = o.at ?? 0;
    const el = h('div', 'tx hand', '', this.html);
    Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', fontSize: size + 'px', lineHeight: lh + 'px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: col('ink') });
    const tokOf = [];
    let ti = 0;
    for (let c = 0; c < o.text.length; c++) { while (o.ends[ti] <= c) ti++; tokOf.push(ti); }
    const spans = [...o.text].map((ch, c) => {
      const sp = h('span', null, null, el);
      if (ch === '\n') {
        if (o.text[c - 1] === '\n') sp.textContent = '\n';
        else { sp.textContent = '↵'; sp.style.color = col('muted'); sp.style.fontSize = size * 0.8 + 'px'; }
      } else sp.textContent = ch;
      if (o.tokLines !== false) sp.style.borderBottom = `3px solid ${col(tokOf[c] % 2 ? 'faint' : 'muted')}`;
      return sp;
    });
    this.show(el, { at, dur: 0.6, dy: 0 });
    const pos = (c) => { const sp = spans[Math.min(c, spans.length - 1)]; return { x: x + sp.offsetLeft, y: y + sp.offsetTop }; };
    // colour by chunk: chunk index of char c = number of cuts <= c
    this.tick((lt) => {
      const cu = o.cuts(lt);
      spans.forEach((sp, c) => {
        const k = cu ? cu.at.filter((a) => a <= c).length : -1;
        const bg = k < 0 || !cu.k ? 'transparent' : col(FILLS[k % FILLS.length]);
        if (sp._bg !== bg) { sp._bg = bg; sp.style.background = bg; }
      });
    });
    return { el, spans, pos, lh, tokOf };
  };

  /**
   * lanes(o) — stations in two lanes (or one), each lane read left to right with arrows between its stations.
   * o: { stations: [{ label, icon, color, lane (0 | 1) }], x0, dx (station spacing), y0, y1 (lane centres), w, h, at(i) → t,
   *   link: [i, j] (a dashed arrow from station i down to station j, e.g. the end of lane 0 to a station of lane 1) }
   * Returns { st(i) → { x, y, w, h, cx, cy } }.
   */
  B.lanes = function (o) {
    const w = o.w ?? 260, hh = o.h ?? 130, S = o.stations;
    const k = S.map((s, i) => S.slice(0, i).filter((q) => (q.lane ?? 0) === (s.lane ?? 0)).length);
    const st = (i) => { const cx = o.x0 + k[i] * o.dx, cy = S[i].lane ? o.y1 : o.y0; return { x: cx - w / 2, y: cy - hh / 2, w, h: hh, cx, cy }; };
    S.forEach((s, i) => {
      const q = st(i), t = o.at(i), c = s.color || 'blue';
      this.box(q.x, q.y, w, hh, { r: 18, fill: c + 'F', color: c, sw: 2.8, at: t, dur: 0.5, texture: false });
      if (s.icon) this.icon(s.icon, q.x + 58, q.cy, 70, { at: t + 0.2, color: c });
      this.text(s.label, { ...(s.icon ? { x: q.x + 100 } : { x: q.cx, w: w - 20, align: 'c' }), y: q.cy - 24, size: s.label.length > 4 ? 30 : 38, weight: 700, color: c, at: t + 0.25, mode: 'fade' });
      const nx = S.findIndex((q2, j) => j > i && (q2.lane ?? 0) === (s.lane ?? 0));
      if (nx > 0) { const n = st(nx); this.arrow(q.x + w + 8, q.cy, n.x - 8, n.cy, { color: 'soft', sw: 3, at: o.at(nx) - 0.2, dur: 0.3 }); }
    });
    if (o.link) {
      const [a, b] = o.link, A = st(a), Bq = st(b);
      this.arrow(A.cx, A.y + hh + 8, Bq.cx + 40, Bq.y - 8, { color: 'green', sw: 3, bend: 0.12, at: o.at(b) - 0.1, dur: 0.5, dashed: true });
    }
    return { st };
  };
})();
