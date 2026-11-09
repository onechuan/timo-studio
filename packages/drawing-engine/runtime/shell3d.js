/* shell3d: the harness "exploded view" — a model core wrapped by nested square shells that lift apart in CSS 3D,
 * with a projector so 2D labels stay flat and legible next to 3D points; plus PV.tw (approximate text width). All pure in lt. */
(function () {
  const { clamp, ease, Builder } = PV;
  const B = Builder.prototype;
  /** Approximate text width: CJK = 1 em, latin ≈ 0.56 em. */
  PV.tw = PV.tw || ((str, size) => [...str].reduce((a, ch) => a + (/[\x00-\x7f]/.test(ch) ? 0.56 : 1), 0) * size);

  /**
   * shell3d(o) — the model core (a slab) at the centre, parts as concentric square frames around it.
   * Assembled (explode = 0) they lie flat and nested; exploded (explode = 1) frame i lifts to z = (i + 1) * gap.
   * o: { cx, cy, core: 160 (core size), step: 64 (frame grows by 2·step each ring), band: 30 (frame width), gap: 90, persp: 1700,
   *      parts: [{ color }], at(i) → t (frame appears; -1 = core), explode(lt) → 0..1, rot(lt) → { rx, rz }, lift(i, lt) → extra z (pull a part out),
   *      op(i, lt) → opacity multiplier, coreLabel: 'LLM' }
   * Returns { S, z(i, lt), proj(x, y, z, lt) → { x, y, s }, corner(i, lt) → screen point at the frame's right-front corner, half(i) }.
   */
  B.shell3d = function (o) {
    const { cx, cy } = o, d = o.persp ?? 1700, core = o.core ?? 160, step = o.step ?? 64, band = o.band ?? 30, gap = o.gap ?? 90;
    const n = o.parts.length;
    this.host.style.perspective = d + 'px';
    this.host.style.perspectiveOrigin = `${STAGE.w / 2}px ${STAGE.h / 2}px`;
    const S = this.layer();
    S.wrap.style.transformStyle = 'preserve-3d';
    S.wrap.style.transformOrigin = `${cx}px ${cy}px`;
    const half = (i) => core / 2 + 14 + (i + 1) * step - step / 2 + band / 2;   // outer half-size of frame i
    // core
    const C = S.layer(), ca = o.at ? o.at(-1) : 0;
    C.box(cx - core / 2 + 8, cy - core / 2 + 10, core, core, { r: 18, fill: 'ink', color: 'ink', sw: 2, at: ca, dur: 0.01, texture: false, rough: 0.5 });
    C.box(cx - core / 2, cy - core / 2, core, core, { r: 18, fill: 'yellow', color: 'ink', sw: 3.4, at: ca, dur: 0.4, texture: false, rough: 0.7 });
    C.text(o.coreLabel ?? '模型', { x: cx, y: cy - 28, w: core, align: 'c', size: 40, weight: 700, at: ca + 0.2, mode: 'fade' });
    const Fs = o.parts.map((pt, i) => {
      const L = S.layer(), hs = half(i), inner = hs - band, c = pt.color, t0 = o.at ? o.at(i) : 0;
      const ring = `M${cx - hs} ${cy - hs} H${cx + hs} V${cy + hs} H${cx - hs} Z M${cx - inner} ${cy - inner} V${cy + inner} H${cx + inner} V${cy - inner} Z`;
      L.path(ring, { fill: c + 'F', color: c, sw: 3, at: t0, dur: 0.01, rough: 0.6, texture: false });
      return L;
    });
    const rot = (lt) => (o.rot ? o.rot(lt) : { rx: 58, rz: -32 });
    const z = (i, lt) => {
      const k = ease.out(clamp((lt - (o.at ? o.at(i) : 0)) / 0.6));
      return (o.explode ? o.explode(lt) : 1) * (i + 1) * gap + (1 - k) * 380 + (o.lift ? o.lift(i, lt) : 0);
    };
    this.tick((lt) => {
      const r = rot(lt);
      S.wrap.style.transform = `rotateX(${r.rx.toFixed(2)}deg) rotateZ(${r.rz.toFixed(2)}deg)`;
      C.wrap.style.opacity = clamp((lt - ca) / 0.3).toFixed(3);
      Fs.forEach((L, i) => {
        const k = clamp((lt - (o.at ? o.at(i) : 0)) / 0.4) * (o.op ? o.op(i, lt) : 1);
        L.wrap.style.transform = `translateZ(${z(i, lt).toFixed(1)}px)`;
        L.wrap.style.opacity = k.toFixed(3);
      });
    });
    const proj = (x, y, zz, lt) => {
      const r = rot(lt), a = (r.rx * Math.PI) / 180, b = (r.rz * Math.PI) / 180;
      const px = x - cx, py = y - cy;
      const x1 = px * Math.cos(b) - py * Math.sin(b), y1 = px * Math.sin(b) + py * Math.cos(b);
      const y2 = y1 * Math.cos(a) - zz * Math.sin(a), z2 = y1 * Math.sin(a) + zz * Math.cos(a);
      const s = d / (d - z2);
      const mx = STAGE.w / 2, my = STAGE.h / 2;
      return { x: mx + (cx + x1 - mx) * s, y: my + (cy + y2 - my) * s, s };
    };
    const corner = (i, lt) => proj(cx + half(i), cy + half(i) * (o.cornerY ?? 1), z(i, lt), lt);
    return { S, z, proj, corner, half };
  };
})();
