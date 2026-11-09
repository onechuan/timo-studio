/* Asking and filtering: a confirmation dialog with two buttons that get pressed (dlg), a padlock that opens (lock), and a CSS-3D
 * stack of sieve plates, coarse to fine (plates3d). Pure in lt. */
(function () {
  const { clamp, ease, lerp, Builder } = PV;
  const B = Builder.prototype;

  /**
   * dlg(x, y, w, cmd, o) — a hand-drawn confirmation on its own layer: robot + a heading (o.head) + a mono command + two buttons.
   * o: { at, dur (draw speed), press: t (the allow button gets clicked), deny: t (the deny button gets clicked), head, info: [str] (extra lines),
   *      yes, no (button labels), cmdColor, size }. Returns { L, h }.
   */
  B.dlg = function (x, y, w, cmd, o = {}) {
    const L = this.layer(), at = o.at ?? 0, d = o.dur ?? 0.4, size = o.size ?? 30, info = o.info || [];
    const hh = 230 + info.length * size * 1.5;
    L.box(x, y, w, hh, { r: 18, fill: 'paper', color: 'ink', sw: 2.6, at, dur: d, texture: false });
    L.icon('robot', x + 58, y + 64, 64, { at: at + d * 0.3 });
    L.text(o.head ?? '想执行：', { x: x + 110, y: y + 26, size: size * 0.9, color: 'soft', at: at + d * 0.4, mode: 'fade', dur: 0.2 });
    L.text(cmd, { x: x + 110, y: y + 26 + size * 1.35, size, font: 'mono', weight: 700, color: o.cmdColor || 'ink', at: at + d * 0.5, mode: 'fade', dur: 0.2, raw: true });
    info.forEach((s, i) => L.text(s, { x: x + 40, y: y + 140 + i * size * 1.5, size: size * 0.86, at: at + d * 0.6 + i * 0.15, mode: 'fade', dur: 0.25 }));
    const by = y + hh - 76, bw = (w - 100) / 2;
    const btn = (bx, label, c, t) => {
      L.box(bx, by, bw, 56, { r: 12, fill: c + 'F', color: c, sw: 2.2, at: at + d * 0.6, dur: d * 0.6, texture: false });
      L.text(label, { x: bx + bw / 2, y: by + 10, w: bw, align: 'c', size: 28, weight: 700, color: c, at: at + d * 0.7, mode: 'fade', dur: 0.2 });
      if (t != null) {
        L.box(bx - 6, by - 6, bw + 12, 68, { r: 14, color: c, sw: 4.5, at: t, dur: 0.15, texture: false, rough: 0.5 });
        L.box(bx, by, bw, 56, { r: 12, fill: c, color: c, sw: 2.2, at: t, dur: 0.12, texture: false });
        L.text(label, { x: bx + bw / 2, y: by + 10, w: bw, align: 'c', size: 28, weight: 700, color: 'paper', at: t + 0.02, mode: 'fade', dur: 0.1 });
      }
    };
    btn(x + 40, o.yes ?? '允许', 'green', o.press);
    btn(x + 60 + bw, o.no ?? '拒绝', 'red', o.deny);
    return { L, h: hh };
  };

  /** lock(cx, cy, s, o) — a padlock (shackle + body). o: { at, color, open: t (shackle lifts) }. Returns the layer. */
  B.lock = function (cx, cy, s = 60, o = {}) {
    const L = this.layer(), c = o.color || 'orange', at = o.at ?? 0;
    const Sh = L.layer();
    Sh.path(`M${cx - s * 0.28} ${cy} V${cy - s * 0.3} A${s * 0.28} ${s * 0.28} 0 0 1 ${cx + s * 0.28} ${cy - s * 0.3} V${cy}`, { color: c, sw: s * 0.09, single: true, rough: 0.5, at, dur: 0.3 });
    L.box(cx - s * 0.45, cy - s * 0.05, s * 0.9, s * 0.7, { r: s * 0.12, fill: c + 'F', color: c, sw: 2.6, at: at + 0.1, dur: 0.3, texture: false });
    L.circle(cx, cy + s * 0.27, s * 0.16, { fill: c, color: c, sw: 1.5, at: at + 0.3, dur: 0.1 });
    if (o.open != null) this.tick((lt) => { Sh.wrap.style.transform = `translateY(${(-s * 0.25 * ease.back(clamp((lt - o.open) / 0.35))).toFixed(1)}px)`; });
    return L;
  };

  /**
   * plates3d(o) — n sieve plates stacked in depth (CSS 3D), each a flat rounded slab with a label, seen from above at an angle.
   * o: { cx, cy, w, h, gap, persp, plates: [{ label, color }], at(i) → t, tilt(lt) → { rx, rz }, alpha (plate opacity, to see through) }
   * Returns { S, P: [layer…], z(i) } — plate i sits at translateZ(-i * gap) (plate 0 on top).
   */
  B.plates3d = function (o) {
    const n = o.plates.length, gap = o.gap ?? 110, w = o.w ?? 640, hh = o.h ?? 300;
    const x = o.cx - w / 2, y = o.cy - hh / 2;
    this.host.style.perspective = (o.persp ?? 1800) + 'px';
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${o.cx}px ${o.cy}px`;
    const Ps = o.plates.map((pl, i) => {
      const L = S.layer(), t0 = o.at(i), c = pl.color;
      L.box(x, y, w, hh, { r: 22, fill: c + 'F', color: c, sw: 3, at: t0, dur: 0.01, texture: false, rough: 0.7 });
      // holes: coarse plates have big holes, fine ones small
      const k = n > 1 ? i / (n - 1) : 0, hs = lerp(70, 26, k), cols = Math.round(lerp(4, 9, k)), rows = Math.round(lerp(2, 4, k));
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const hx = x + 150 + (q + 0.5) * ((w - 190) / cols), hy = y + 40 + (r + 0.5) * ((hh - 80) / rows);
        L.circle(hx, hy, hs, { fill: 'paper', color: c, sw: 1.6, at: t0, dur: 0.01, rough: 0.6 });
      }
      L.text(pl.label, { x: x + 24, y: y + 20, size: 30, weight: 700, color: c, at: t0, mode: 'fade', dur: 0.01 });
      return L;
    });
    this.tick((lt) => {
      const tl = o.tilt ? o.tilt(lt) : {};
      S.wrap.style.transform = `rotateX(${(tl.rx ?? 58).toFixed(2)}deg) rotateZ(${(tl.rz ?? -28).toFixed(2)}deg)`;
      Ps.forEach((L, i) => {
        const k = ease.out(clamp((lt - o.at(i)) / 0.5));
        L.wrap.style.transform = `translateZ(${(-i * gap - (1 - k) * 240).toFixed(1)}px)`;
        L.wrap.style.opacity = (k * (o.alpha ?? 1)).toFixed(3);
      });
    });
    return { S, P: Ps, z: (i) => -i * gap };
  };
})();
