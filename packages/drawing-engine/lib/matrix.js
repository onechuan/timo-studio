/* Grids and windows: a rows × cols grid that collapses into a hub, N×M → N+M (matrix), a log of one-line messages scrolling up a
 * window (tape), a hand-drawn editor window (editor), a two-faced CSS-3D flip card (flipc) and a CSS-3D stage with depth planes
 * (stage3d). All pure in lt. */
(function () {
  const { clamp, lerp, ease, col, Builder } = PV;
  const B = Builder.prototype;

  /**
   * matrix(o) — a rows × cols grid (one block per pair). o: { x, y, cw, ch, gap, rows: [{ logo, label, color }], cols: [{ logo, label }],
   *   fillAt(i, j) → t, collapse: t, hub: { x, y, label, color, logo }, at, head (px for header band) }
   * Each cell pops in as a hatched block at fillAt; at `collapse` the cells shrink into the hub and the hub is wired to
   * every row header and every column header (N + M links). Returns { count(lt), hubAt }.
   */
  B.matrix = function (o) {
    const R = o.rows, C = o.cols, cw = o.cw ?? 150, ch = o.ch ?? 100, gap = o.gap ?? 14, at = o.at ?? 0, head = o.head ?? 150;
    const gx = o.x + head, gy = o.y + head * 0.7, cx = (j) => gx + j * (cw + gap) + cw / 2, cy = (i) => gy + i * (ch + gap) + ch / 2;
    const hub = o.hub, tC = o.collapse ?? 1e9;
    R.forEach((r, i) => {
      const t = at + i * 0.15;
      if (r.logo) this.logo(r.logo, o.x + head * 0.35, cy(i), Math.min(64, ch * 0.64), { at: t });
      if (r.label) this.text(r.label, { x: o.x + head * 0.35, y: cy(i) + (r.logo ? 26 : -18), w: head, align: 'c', size: r.size ?? 26, weight: 700, color: r.color || 'ink', at: t + 0.1, mode: 'fade' });
    });
    C.forEach((c, j) => {
      const t = at + 0.3 + j * 0.15;
      if (c.logo) this.logo(c.logo, cx(j), o.y + head * 0.22, 56, { at: t });
      if (c.label) this.text(c.label, { x: cx(j), y: o.y + (c.logo ? head * 0.22 + 30 : head * 0.12), w: cw + gap, align: 'c', size: c.size ?? 26, weight: 700, color: c.color || 'ink', at: t + 0.1, mode: 'fade' });
    });
    const cellK = (i, j, lt) => ease.back(clamp((lt - o.fillAt(i, j)) / 0.3));
    const colK = (i, j, lt) => ease.inOut(clamp((lt - tC - (i * C.length + j) * 0.03) / 0.55));
    this.liveRough((lt, Rr) => {
      const out = [];
      R.forEach((r, i) => C.forEach((c, j) => {
        const f = cellK(i, j, lt), k = colK(i, j, lt), s = f * (1 - k);
        if (s < 0.03) return;
        const x = lerp(cx(j), hub.x, k), y = lerp(cy(i), hub.y, k), c0 = r.color || 'blue';
        out.push(Rr.box(x - (cw / 2) * s, y - (ch / 2) * s, cw * s, ch * s, { r: 10, fill: c0 + 'F', color: c0, sw: 2.2, seed: 300 + i * 17 + j, rough: 0.8 }));
      }));
      const kL = (n, lt2) => ease.out(clamp((lt2 - tC - 0.9 - n * 0.12) / 0.4));
      R.forEach((r, i) => { const k = kL(i, lt); if (k > 0) { const x0 = o.x + head - 6, y0 = cy(i); out.push(Rr.line(x0, y0, lerp(x0, hub.x - 60, k), lerp(y0, hub.y, k), { color: r.color || 'blue', sw: 3.4, seed: 500 + i, rough: 0.5 })); } });
      C.forEach((c, j) => { const k = kL(R.length + j, lt); if (k > 0) { const y1 = gy - 12; out.push(Rr.line(hub.x, hub.y - 40, lerp(hub.x, cx(j), k), lerp(hub.y - 40, y1, k), { color: hub.color || 'orange', sw: 3.4, seed: 600 + j, rough: 0.5 })); } });
      return out;
    });
    if (o.cellText) R.forEach((r, i) => C.forEach((c, j) => this.follow((lt) => {
      const s = cellK(i, j, lt) * (1 - colK(i, j, lt));
      return s < 0.5 ? null : { text: o.cellText, x: cx(j), y: cy(i) - 18, opacity: (s - 0.5) * 2 };
    }, { size: 26, weight: 700, color: r.color || 'blue', w: cw })));
    const H = this.layer();
    H.circle(hub.x, hub.y, hub.d ?? 150, { fill: 'paper', color: hub.color || 'orange', sw: 3.4, at: -5, dur: 0.01, texture: false });
    if (hub.logo) H.logo(hub.logo, hub.x, hub.y - 18, 56, { at: -5, dur: 0.01 });
    H.text(hub.label, { x: hub.x, y: hub.y - (hub.logo ? -12 : 26), w: 200, align: 'c', size: hub.size ?? 40, font: 'latin', weight: 700, color: hub.color || 'orange', at: -5, mode: 'fade', dur: 0.01 });
    const hubAt = tC + 0.5;
    this.tick((lt) => {
      const k = ease.back(clamp((lt - hubAt) / 0.5));
      H.wrap.style.opacity = lt < hubAt ? '0' : '1';
      H.wrap.style.transformOrigin = `${hub.x}px ${hub.y}px`;
      H.wrap.style.transform = `scale(${lerp(0.3, 1, k).toFixed(3)})`;
    });
    const count = (lt) => {
      if (lt < tC + 0.6) { let n = 0; R.forEach((r, i) => C.forEach((c, j) => { if (lt >= o.fillAt(i, j)) n++; })); return n; }
      let n = 0; for (let q = 0; q < R.length + C.length; q++) if (lt > tC + 0.9 + q * 0.12 + 0.2) n++;
      return Math.max(n, 0);
    };
    return { count, hubAt, cx, cy };
  };

  /**
   * tape(x, y, w, h, items, o) — a log of one-line messages scrolling up a window, each marked by its direction.
   * items: [{ t, dir: 'r' (sent →) | 'l' (received ←), text (one line), label (shown instead of text), bytes, color }]
   * The newest line enters at the bottom; older lines scroll up and fade at the top. o: { at, size, rowH, title }.
   */
  B.tape = function (x, y, w, hh, items, o = {}) {
    const at = o.at ?? 0, size = o.size ?? 24, rowH = o.rowH ?? 64, maxRows = Math.floor((hh - 20) / rowH);
    this.box(x, y, w, hh, { r: 16, fill: 'paper', color: 'soft', sw: 2.4, at, dur: 0.6, texture: false });
    if (o.title) this.text(o.title, { x: x + 20, y: y - 44, size: 26, color: 'muted', at: at + 0.2, mode: 'fade' });
    const nAt = (lt) => items.filter((it) => lt >= it.t).length;
    const scroll = (lt) => { let s = 0; items.forEach((it, i) => { s += ease.inOut(clamp((lt - it.t) / 0.35)) * (i >= maxRows ? 1 : 0); }); return s; };
    const chars = Math.floor((w - 250) / (size * 0.6));
    items.forEach((it, i) => {
      const L = this.layer(), c = it.color || (it.dir === 'r' ? 'blue' : 'green'), ry = y + 12 + i * rowH;
      L.box(x + 12, ry, w - 24, rowH - 10, { r: 10, fill: c + 'F', color: c, sw: 1.8, at: -5, dur: 0.01, texture: false, rough: 0.5 });
      L.text(it.dir === 'r' ? '→' : '←', { x: x + 24, y: ry + (rowH - 10 - size * 1.4) / 2, size: size + 2, weight: 700, color: c, at: -5, mode: 'fade', dur: 0.01, raw: true });
      const src = it.label ?? it.text, s = src.length > chars ? src.slice(0, chars - 1) + '…' : src;
      L.text(s, { x: x + 58, y: ry + (rowH - 10 - size * 1.4) / 2, size, font: 'mono', weight: it.label ? 700 : 400, color: it.label ? c : 'ink', at: -5, mode: 'fade', dur: 0.01, raw: true });
      if (it.bytes) L.text(`${it.bytes} B`, { x: x + w - 95, y: ry + (rowH - 10 - size * 1.4) / 2, w: 120, align: 'c', size, font: 'mono', weight: 700, color: c, at: -5, mode: 'fade', dur: 0.01, raw: true });
      this.tick((lt) => {
        const k = ease.out(clamp((lt - it.t) / 0.35)), top = ry - scroll(lt) * rowH;
        const vis = clamp((top - y + rowH * 0.3) / (rowH * 0.6));
        L.wrap.style.opacity = (lt < it.t ? 0 : Math.min(k, vis)).toFixed(3);
        L.wrap.style.transform = `translate(${((1 - k) * (it.dir === 'r' ? -60 : 60)).toFixed(1)}px, ${(top - ry).toFixed(1)}px)`;
      });
    });
    return { nAt };
  };

  /** editor(x, y, w, h, o) — a hand-drawn editor window: title bar with three dots and a caption. o: { at, title, color } */
  B.editor = function (x, y, w, hh, o = {}) {
    const at = o.at ?? 0, c = o.color || 'ink';
    this.box(x, y, w, hh, { r: 16, fill: 'paper', color: c, sw: 2.6, at, dur: 0.7, texture: false });
    this.line(x + 4, y + 54, x + w - 4, y + 54, { color: 'faint', sw: 2, at: at + 0.3, dur: 0.4 });
    ['red', 'orange', 'green'].forEach((k, i) => this.circle(x + 30 + i * 28, y + 27, 15, { fill: k + 'F', color: k, sw: 1.6, at: at + 0.35 + i * 0.05, dur: 0.2 }));
    if (o.title) this.text(o.title, { x: x + w / 2, y: y + 10, w: w - 220, align: 'c', size: 26, color: 'muted', at: at + 0.4, mode: 'fade' });
    return { x: x + 24, y: y + 74, w: w - 48, h: hh - 94 };
  };

  /**
   * flipc(cx, cy, o) — two builders (front, back) on one card that flips around Y at o.at over o.dur (or o.flip(lt) → 0..1).
   * Draw into the returned [F, Bk]. Uses per-layer perspective so it works anywhere on the page.
   */
  B.flipc = function (cx, cy, o = {}) {
    const F = this.layer(), Bk = this.layer(), ax = o.axis === 'x' ? 'rotateX' : 'rotateY', p = o.persp ?? 1600;
    this.tick((lt) => {
      const f = o.flip ? clamp(o.flip(lt)) : ease.inOut(clamp((lt - (o.at ?? 1e9)) / (o.dur ?? 0.9))), a = f * 180;
      [F, Bk].forEach((L, i) => {
        L.wrap.style.transformOrigin = `${cx}px ${cy}px`;
        L.wrap.style.transform = `perspective(${p}px) ${ax}(${(i ? a - 180 : a).toFixed(2)}deg)`;
        L.wrap.style.opacity = (i ? a >= 90 : a < 90) ? '1' : '0';
      });
    });
    return [F, Bk];
  };

  /**
   * stage3d(o) — a CSS-3D group. o: { cx, cy, persp, tilt(lt) → { rx, ry, rz, s } }. Returns { S, plane(z) } where plane(z)
   * gives a child builder sitting at translateZ(z) (z < 0 = further away). Everything inside shares one perspective.
   */
  B.stage3d = function (o) {
    this.host.style.perspective = (o.persp ?? 1600) + 'px';
    this.host.style.perspectiveOrigin = `${o.cx}px ${o.cy}px`;
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${o.cx}px ${o.cy}px`;
    this.tick((lt) => {
      const t = o.tilt ? o.tilt(lt) : {};
      S.wrap.style.transform = `rotateX(${(t.rx ?? 0).toFixed(2)}deg) rotateY(${(t.ry ?? 0).toFixed(2)}deg) rotateZ(${(t.rz ?? 0).toFixed(2)}deg) scale(${(t.s ?? 1).toFixed(4)})`;
    });
    const plane = (z, fn) => {
      const L = S.layer();
      this.tick((lt) => {
        const v = typeof z === 'function' ? z(lt) : { z };
        L.wrap.style.transform = `translate3d(${(v.x ?? 0).toFixed(1)}px, ${(v.y ?? 0).toFixed(1)}px, ${(v.z ?? 0).toFixed(1)}px)`;
        if (v.op != null) L.wrap.style.opacity = clamp(v.op).toFixed(3);
      });
      return L;
    };
    return { S, plane };
  };

  /** UTF-8 byte length of one line (incl. the newline). */
  PV.bytes = (line) => new TextEncoder().encode(line + '\n').length;
})();
