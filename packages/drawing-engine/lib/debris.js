/* Marks and boxes: a small "示意" ("illustrative") tag for made-up examples and illustrative numbers (demo), a layer that drops off the page like
 * debris (fall), a server / container box with a heading (srv) and a square-wave blinker for status lights (PV.blink). Pure in lt. */
(function () {
  const { clamp, ease, Builder } = PV;
  const B = Builder.prototype;

  /** demo(x, y, o) — a small muted "示意" ("illustrative") tag (for made-up examples and illustrative numbers). o: { at, label, w } */
  B.demo = function (x, y, o = {}) {
    const label = o.label ?? '示意';
    return this.chip(x, y, o.w ?? Math.max(90, label.length * 26 + 30), label, { color: 'muted', h: 42, size: 24, at: o.at ?? 0 });
  };

  /**
   * fall(L, t, o) — make layer L drop off the page at time t (debris): accelerates down, spins a little, fades.
   * o: { spin (deg/s), dx (px/s drift), g (px/s²), origin: [x, y] }
   */
  B.fall = function (L, t, o = {}) {
    if (o.origin) L.wrap.style.transformOrigin = `${o.origin[0]}px ${o.origin[1]}px`;
    const g = o.g ?? 1800, spin = o.spin ?? 30, dx = o.dx ?? 0;
    this.tick((lt) => {
      const u = lt - t;
      if (u <= 0) { L.wrap.style.transform = ''; L.wrap.style.opacity = ''; return; }
      L.wrap.style.transform = `translate(${(dx * u).toFixed(1)}px, ${(0.5 * g * u * u).toFixed(1)}px) rotate(${(spin * u).toFixed(2)}deg)`;
      L.wrap.style.opacity = (1 - clamp((u - 0.5) / 0.6)).toFixed(3);
    });
    return L;
  };

  /**
   * srv(x, y, w, h, label, o) — a container / server box with a heading chip and an optional logo.
   * o: { at, color, logo, fill, size }. Returns { x, y, w, h }.
   */
  B.srv = function (x, y, w, hh, label, o = {}) {
    const at = o.at ?? 0, c = o.color || 'ink', size = o.size ?? 30;
    this.box(x, y, w, hh, { r: 20, fill: o.fill || 'paper', color: c, sw: 3, at, dur: 0.6, texture: false });
    const lx = o.logo ? x + 70 : x + 24;
    if (o.logo) this.logo(o.logo, x + 40, y + 34, 40, { at: at + 0.3 });
    this.text(label, { x: lx, y: y + 34 - size * 0.7, size, weight: 700, color: c, at: at + 0.3, mode: 'fade' });
    return { x, y, w, h: hh };
  };


  /** blink(lt, t0, hz) → 0/1 square wave after t0 (for status lights). */
  PV.blink = (lt, t0 = 0, hz = 2) => (lt < t0 ? 0 : Math.floor((lt - t0) * hz * 2) % 2 === 0 ? 1 : 0);
  PV.eout = ease.out;
})();
