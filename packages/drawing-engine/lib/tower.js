/* Towers and cards: a CSS-3D tower of slabs with a matching projector (tower3d), a label card that flips in 3D to new text
 * (flipcard), and a file card with a folded corner and a tag (memcard). All pure in lt. */
(function () {
  const { clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;

  /**
   * tower3d(o) — square slabs stacked in depth (level 0 = top = smallest), seen from an angle, slowly turning.
   * o: { cx, cy, levels: [{ w, h (defaults to w), color, draw(L, x, y, w, h) (extra marks on the slab) }], dz (height step), persp, at(i) → t (slab drops in), rot(lt) → { rx, rz } }
   * Returns { S (the 3D layer: add movers with S.layer()), z(i) (slab height), proj(x, y, z, lt) → screen { x, y, s } }.
   * proj uses the same maths as CSS (rotateX(rx) rotateZ(rz) about (cx, cy), perspective from the page centre), so 2D labels can sit on 3D points.
   */
  B.tower3d = function (o) {
    const n = o.levels.length, dz = o.dz ?? 120, d = o.persp ?? 1700, { cx, cy } = o;
    const z = (i) => (n - 1 - i) * dz - ((n - 1) * dz) / 2;
    this.host.style.perspective = d + 'px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${cx}px ${cy}px`;
    const Ls = o.levels.map((lv, i) => {
      const L = S.layer(), w = lv.w, hh = lv.h ?? lv.w, c = lv.color;
      L.box(cx - w / 2 + 10, cy - hh / 2 + 14, w, hh, { r: 16, fill: c, color: c, sw: 2, at: -1, dur: 0.01, texture: false, rough: 0.6 });
      L.box(cx - w / 2, cy - hh / 2, w, hh, { r: 16, fill: c + 'F', color: c, sw: 3.2, at: -1, dur: 0.01, texture: false, rough: 0.7 });
      if (lv.draw) lv.draw(L.layer(), cx - w / 2, cy - hh / 2, w, hh);
      return L;
    });
    const rot = (lt) => (o.rot ? o.rot(lt) : { rx: 60, rz: -30 });
    this.tick((lt) => {
      const r = rot(lt);
      S.wrap.style.transform = `rotateX(${r.rx.toFixed(2)}deg) rotateZ(${r.rz.toFixed(2)}deg)`;
      Ls.forEach((L, i) => {
        const k = ease.out(clamp((lt - o.at(i)) / 0.6));
        L.wrap.style.transform = `translateZ(${(z(i) + (1 - k) * 320).toFixed(1)}px)`;
        L.wrap.style.opacity = k.toFixed(3);
      });
    });
    const proj = (x, y, zz, lt) => {
      const r = rot(lt), a = (r.rx * Math.PI) / 180, b = (r.rz * Math.PI) / 180;
      let px = x - cx, py = y - cy;
      const x1 = px * Math.cos(b) - py * Math.sin(b), y1 = px * Math.sin(b) + py * Math.cos(b);
      const y2 = y1 * Math.cos(a) - zz * Math.sin(a), z2 = y1 * Math.sin(a) + zz * Math.cos(a);
      const s = d / (d - z2);
      return { x: 960 + (cx + x1 - 960) * s, y: 540 + (cy + y2 - 540) * s, s };
    };
    return { S, z, proj };
  };

  /**
   * flipcard(x, y, w, h, front, back, o) — a paper card on its own layer showing front = [title, sub]; at o.flip it turns over (rotateX) to back.
   * o: { at, flip, color, backColor, size, subSize }. Returns the layer.
   */
  B.flipcard = function (x, y, w, hh, front, back, o = {}) {
    const at = o.at ?? 0, c = o.color || 'soft', bc = o.backColor || c, size = o.size ?? 38, ss = o.subSize ?? 28;
    const L = this.layer();
    const face = (F, col, show) => {
      const A = L.layer();
      A.box(x, y, w, hh, { r: 14, fill: show ? col + 'F' : 'paper', color: col, sw: 2.6, at: show ? -1 : at, dur: show ? 0.01 : 0.4, texture: false, rough: 0.7 });
      A.text(F[0], { x: x + 24, y: y + (F[1] ? 12 : (hh - size * 1.4) / 2), size, weight: 700, color: col, at: show ? -1 : at + 0.2, mode: 'fade', dur: show ? 0.01 : 0.3 });
      if (F[1]) A.text(F[1], { x: x + 24, y: y + 16 + size * 1.3, size: ss, color: 'soft', at: show ? -1 : at + 0.3, mode: 'fade', dur: show ? 0.01 : 0.3 });
      return A;
    };
    const Fr = face(front, c, false), Bk = back ? face(back, bc, true) : null;
    this.tick((lt) => {
      const k = o.flip == null ? 0 : ease.inOut(clamp((lt - o.flip) / 0.6)), deg = 180 * k, onBack = k >= 0.5 && Bk;
      Fr.wrap.style.visibility = onBack ? 'hidden' : 'visible';
      if (Bk) Bk.wrap.style.visibility = onBack ? 'visible' : 'hidden';
      L.wrap.style.transformOrigin = `${x + w / 2}px ${y + hh / 2}px`;
      L.wrap.style.transform = `perspective(900px) rotateX(${(onBack ? deg - 180 : deg).toFixed(1)}deg)`;
    });
    return L;
  };

  /**
   * memcard(x, y, w, h, name, o) — a file: folded corner, mono file name, an optional tag chip and a few grey lines.
   * o: { at, tag (chip text), color, lines, size, dur, sub (a line of real text instead of grey lines) }
   */
  B.memcard = function (x, y, w, hh, name, o = {}) {
    const at = o.at ?? 0, c = o.color || 'soft', size = o.size ?? 26, dur = o.dur ?? 0.35, f = 26;
    this.path(`M${x} ${y} H${x + w - f} L${x + w} ${y + f} V${y + hh} H${x} Z`, { fill: 'paper', color: c, sw: 2.4, at, dur, rough: 0.6 });
    this.path(`M${x + w - f} ${y} V${y + f} H${x + w}`, { color: c, sw: 2, at: at + dur * 0.6, dur: 0.15, rough: 0.5, single: true });
    this.text(name, { x: x + 16, y: y + 10, size, font: 'mono', weight: 700, color: c, at: at + dur * 0.5, mode: 'fade', dur: 0.2, raw: true });
    let top = y + size * 1.6 + 14;
    if (o.tag) {
      this.chip(x + 16, top, PV.tw(o.tag, 24) + 34, o.tag, { color: c, at: at + dur, h: 38, size: 24 });
      top += 50;
    }
    if (o.sub) { this.text(o.sub, { x: x + 16, y: top, w: w - 32, size: o.subSize ?? 26, color: 'ink', at: at + dur + 0.1, mode: 'fade', dur: 0.3, lh: 1.35 }); return; }
    const n = o.lines ?? 2, gap = (y + hh - 12 - top) / Math.max(1, n);
    for (let i = 0; i < n; i++) this.line(x + 16, top + (i + 0.5) * gap, x + 16 + (w - 32) * (0.5 + ((i * 37) % 45) / 100), top + (i + 0.5) * gap, { color: 'faint', sw: 3, at: at + dur, dur: 0.15 });
  };
})();
