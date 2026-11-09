/* Doodle icons, drawn in a 100×100 unit box centred on (0,0) and scaled into place. */
(function () {
  const { gen, col, Builder, rrect } = PV;

  function unitApi(B, k, base) {
    const ro = (o = {}) => B.ro(Object.assign({}, base, o, { sw: (o.sw ?? base.sw ?? 2.6) / k, fw: (o.fw ?? 1.5) / k, gap: (o.gap ?? 8) / k }));
    return {
      path: (d, o) => gen.path(d, ro(o)),
      circle: (x, y, d, o) => gen.circle(x, y, d, ro(o)),
      ellipse: (x, y, w, h, o) => gen.ellipse(x, y, w, h, ro(o)),
      line: (x1, y1, x2, y2, o) => gen.line(x1, y1, x2, y2, ro(o)),
      rect: (x, y, w, h, o) => gen.path(rrect(x, y, w, h, (o && o.r) ?? 6), ro(o)),
      curve: (pts, o) => gen.curve(pts, ro(o)),
    };
  }

  const F = {
    person: (u, o) => [
      u.circle(0, -22, 34, { fill: o.fill || 'orangeF' }),
      u.path('M-34 44 C-34 10 -18 0 0 0 C18 0 34 10 34 44', { fill: o.fill || 'orangeF' }),
    ],
    robot: (u, o) => [
      u.line(0, -44, 0, -30), u.circle(0, -47, 9, { fill: 'redF', color: 'red' }),
      u.rect(-34, -30, 68, 56, { r: 14, fill: o.fill || 'blueF' }),
      u.circle(-14, -6, 12, { fill: 'ink' }), u.circle(14, -6, 12, { fill: 'ink' }),
      u.path('M-12 12 Q0 20 12 12'),
      u.line(-34, -6, -42, -6), u.line(34, -6, 42, -6),
      u.rect(-22, 30, 44, 18, { r: 6, fill: o.fill || 'blueF' }),
    ],
    wheel: (u, o) => [
      u.circle(0, 0, 90, { sw: 4 }), u.circle(0, 0, 70, { sw: 1.6, color: 'soft' }),
      u.circle(0, 0, 20, { fill: o.fill || 'orangeF' }),
      u.line(-10, 2, -44, 8, { sw: 3.5 }), u.line(10, 2, 44, 8, { sw: 3.5 }), u.line(0, 10, 0, 44, { sw: 3.5 }),
    ],
    file: (u, o) => [
      u.path('M-30 -44 H14 L32 -26 V44 H-30 Z', { fill: o.fill || 'paper' }),
      u.path('M14 -44 V-26 H32'),
      u.line(-18, -14, 18, -14, { sw: 2, color: 'muted' }), u.line(-18, 0, 20, 0, { sw: 2, color: 'muted' }),
      u.line(-18, 14, 10, 14, { sw: 2, color: 'muted' }), u.line(-18, 28, 16, 28, { sw: 2, color: 'muted' }),
    ],
    terminal: (u, o) => [
      u.rect(-46, -36, 92, 72, { r: 8, fill: o.fill || '#3A332D' }),
      u.line(-46, -22, 46, -22, { color: '#8a8177' }),
      u.path('M-30 -4 L-16 6 L-30 16', { color: '#F4EEE2', sw: 3.2 }),
      u.line(-8, 18, 14, 18, { color: '#F4EEE2', sw: 3.2 }),
    ],
    gear: (u, o) => {
      let d = '';
      const n = 8;
      for (let i = 0; i < n * 2; i++) {
        const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
        const r = i % 2 ? 32 : 42;
        d += `${i ? 'L' : 'M'}${(Math.cos(a0) * r).toFixed(1)} ${(Math.sin(a0) * r).toFixed(1)} L${(Math.cos(a1) * r).toFixed(1)} ${(Math.sin(a1) * r).toFixed(1)} `;
      }
      return [u.path(d + 'Z', { fill: o.fill || 'faint' }), u.circle(0, 0, 26, { fill: 'paper' })];
    },
    magnifier: (u, o) => [u.circle(-8, -8, 56, { fill: o.fill || 'blueF', sw: 3.2 }), u.line(12, 12, 40, 40, { sw: 6 })],
    bulb: (u, o) => [
      u.path('M-16 16 C-30 4 -32 -12 -26 -24 C-18 -40 18 -40 26 -24 C32 -12 30 4 16 16 Z', { fill: o.fill || 'orangeF' }),
      u.rect(-14, 16, 28, 16, { r: 3, fill: 'faint' }), u.line(-10, 38, 10, 38),
      u.line(-38, -40, -44, -46, { sw: 2.4, color: 'orange' }), u.line(38, -40, 44, -46, { sw: 2.4, color: 'orange' }), u.line(0, -50, 0, -58, { sw: 2.4, color: 'orange' }),
    ],
    wrench: (u, o) => [
      u.path('M-36 36 L6 -6 C0 -22 10 -40 30 -38 L18 -24 L24 -14 L36 -16 C38 4 22 12 8 6 L-34 44 C-40 48 -44 42 -36 36 Z', { fill: o.fill || 'greenF' }),
    ],
    eye: (u, o) => [
      u.path('M-46 0 C-26 -30 26 -30 46 0 C26 30 -26 30 -46 0 Z', { fill: 'paper' }),
      u.circle(0, 0, 32, { fill: o.fill || 'purpleF' }), u.circle(0, 0, 12, { fill: 'ink' }),
    ],
    clock: (u, o) => [u.circle(0, 0, 84, { fill: o.fill || 'paper' }), u.line(0, 0, 0, -28, { sw: 3.4 }), u.line(0, 0, 20, 8, { sw: 3.4 })],
    hourglass: (u, o) => [
      u.line(-28, -44, 28, -44, { sw: 4 }), u.line(-28, 44, 28, 44, { sw: 4 }),
      u.path('M-22 -44 C-22 -10 22 -10 22 -44 M-22 44 C-22 10 22 10 22 44 M-22 -44 C-22 -14 -4 -6 -4 0 C-4 6 -22 14 -22 44 M22 -44 C22 -14 4 -6 4 0 C4 6 22 14 22 44'),
      u.path('M-14 40 C-10 26 10 26 14 40 Z', { fill: o.fill || 'orangeF', color: 'orange' }),
    ],
    scissors: (u, o) => [
      u.circle(-26, 26, 26, { fill: o.fill || 'redF' }), u.circle(-26, -26, 26, { fill: o.fill || 'redF' }),
      u.line(-16, 18, 42, -30, { sw: 3.4 }), u.line(-16, -18, 42, 30, { sw: 3.4 }),
    ],
    warn: (u, o) => [u.path('M0 -42 L44 38 H-44 Z', { fill: o.fill || 'orangeF', color: o.color || 'orange' }), u.line(0, -14, 0, 12, { sw: 5 }), u.circle(0, 26, 5, { fill: 'ink' })],
    door: (u, o) => [
      u.rect(-30, -46, 60, 92, { r: 3, fill: o.fill || 'faint' }),
      u.path('M-30 -46 L10 -36 V54 L-30 46 Z', { fill: 'paper' }),
      u.circle(2, 6, 6, { fill: 'ink' }),
    ],
    flag: (u, o) => [u.line(-30, 46, -30, -44, { sw: 3.6 }), u.path('M-30 -44 C-10 -54 8 -34 34 -42 V-6 C8 2 -10 -18 -30 -8 Z', { fill: o.fill || 'greenF', color: o.color || 'green' })],
    sun: (u, o) => {
      const rays = [];
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; rays.push(u.line(Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 44, Math.sin(a) * 44, { color: 'orange', sw: 3 })); }
      return [u.circle(0, 0, 40, { fill: 'orangeF', color: 'orange' }), ...rays];
    },
    stack: (u, o) => [0, 1, 2].map((i) => u.rect(-36 + i * 6, -30 + i * -8, 66, 76, { r: 4, fill: 'paper' })),
    bird: (u, o) => [
      u.path('M-40 8 C-34 -22 -4 -30 16 -18 C26 -30 40 -26 44 -18 L52 -14 L42 -10 C44 14 22 34 -8 32 C-22 32 -34 24 -40 8 Z', { fill: o.fill || 'orangeF' }),
      u.path('M-24 4 C-10 -8 8 -2 14 12 C0 16 -14 14 -24 4 Z', { fill: 'orange', color: 'orange' }),
      u.circle(32, -16, 6, { fill: 'ink' }),
      u.path('M-40 8 L-58 2 L-50 14 L-60 22 L-38 18'),
      u.line(-6, 32, -10, 46, { sw: 2.4 }), u.line(6, 32, 4, 46, { sw: 2.4 }),
    ],
    plug: (u, o) => [u.rect(-24, -20, 48, 44, { r: 8, fill: o.fill || 'blueF' }), u.line(-10, -20, -10, -40, { sw: 4 }), u.line(10, -20, 10, -40, { sw: 4 }), u.path('M0 24 C0 40 20 40 26 50')],
    puzzle: (u, o) => [u.path('M-36 -36 H-8 C-8 -50 12 -50 12 -36 H36 V-8 C50 -8 50 12 36 12 V36 H-36 Z', { fill: o.fill || 'purpleF', color: 'purple' })],
    brain: (u, o) => [
      u.path('M0 -36 C-20 -46 -44 -32 -38 -12 C-52 -4 -46 22 -30 24 C-28 40 -8 44 0 34 C8 44 28 40 30 24 C46 22 52 -4 38 -12 C44 -32 20 -46 0 -36 Z', { fill: o.fill || 'redF' }),
      u.path('M0 -36 V34 M-20 -14 C-10 -10 -10 4 -22 8 M20 -14 C10 -10 10 4 22 8', { sw: 2 }),
    ],
    shield: (u, o) => [u.path('M0 -44 L36 -30 C36 10 22 32 0 46 C-22 32 -36 10 -36 -30 Z', { fill: o.fill || 'greenF', color: o.color || 'green' })],
    rocket: (u, o) => [
      u.path('M0 -48 C20 -30 22 0 14 26 H-14 C-22 0 -20 -30 0 -48 Z', { fill: 'paper' }),
      u.circle(0, -12, 16, { fill: 'blueF' }),
      u.path('M-14 10 L-30 30 L-14 26 Z M14 10 L30 30 L14 26 Z', { fill: 'redF', color: 'red' }),
      u.path('M-8 30 C-6 42 6 42 8 30', { color: 'orange', fill: 'orangeF' }),
    ],
    fuse: (u, o) => [
      u.rect(-40, -16, 80, 32, { r: 14, fill: 'paper' }),
      u.rect(-48, -18, 14, 36, { r: 4, fill: 'faint' }), u.rect(34, -18, 14, 36, { r: 4, fill: 'faint' }),
      u.path('M-34 0 C-20 -12 -8 12 0 0 C8 -12 20 12 34 0', { color: o.color || 'orange', sw: 2.4 }),
    ],
    spinner: (u, o) => [u.circle(0, 0, 70, { color: 'faint', sw: 6 }), u.path('M0 -35 A35 35 0 0 1 35 0', { color: o.color || 'muted', sw: 6 })],
    chat: (u, o) => [u.path('M-44 -30 C-44 -40 -38 -44 -30 -44 H30 C38 -44 44 -40 44 -30 V8 C44 16 38 22 30 22 H-6 L-24 40 L-20 22 H-30 C-38 22 -44 16 -44 8 Z', { fill: o.fill || 'paper' })],
    cpu: (u, o) => {
      const pins = [];
      for (const i of [-20, 0, 20]) {
        pins.push(u.line(i, -30, i, -42), u.line(i, 30, i, 42), u.line(-30, i, -42, i), u.line(30, i, 42, i));
      }
      return [u.rect(-30, -30, 60, 60, { r: 6, fill: o.fill || 'faint' }), u.rect(-14, -14, 28, 28, { r: 3, fill: 'paper' }), ...pins];
    },
    stop: (u, o) => {
      let d = '';
      for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * Math.PI * 2; d += `${i ? 'L' : 'M'}${(Math.cos(a) * 44).toFixed(1)} ${(Math.sin(a) * 44).toFixed(1)} `; }
      return [u.path(d + 'Z', { fill: 'redF', color: 'red' }), u.line(-18, 0, 18, 0, { color: 'red', sw: 6 })];
    },
    box3d: (u, o) => [u.path('M-36 -18 L0 -36 L36 -18 L36 24 L0 42 L-36 24 Z', { fill: o.fill || '#3A332D', color: 'ink' }), u.path('M-36 -18 L0 0 L36 -18 M0 0 V42', { color: '#6f655b' })],
    books: (u, o) => [
      u.rect(-40, -30, 18, 74, { r: 2, fill: 'blueF' }), u.rect(-20, -40, 20, 84, { r: 2, fill: 'orangeF' }),
      u.path('M4 -26 L22 -30 L38 42 L20 46 Z', { fill: 'greenF' }), u.line(-46, 46, 46, 46, { sw: 3.4 }),
    ],
    sparkle: (u, o) => [u.path('M0 -40 C4 -8 8 -4 40 0 C8 4 4 8 0 40 C-4 8 -8 4 -40 0 C-8 -4 -4 -8 0 -40 Z', { fill: o.fill || 'orangeF', color: o.color || 'orange' })],
  };

  /** icon(name, cx, cy, size, { at, dur, fill, color, rot }) */
  Builder.prototype.icon = function (name, x, y, size = 100, o = {}) {
    const k = size / 100;
    const u = unitApi(this, k, { color: o.color, sw: o.sw });
    const items = F[name](u, o);
    const hnd = this.draw(items, Object.assign({ dur: 0.9 }, o));
    hnd.el.setAttribute('transform', `translate(${x} ${y}) rotate(${o.rot || 0}) scale(${k})`);
    return hnd;
  };
  PV.DOODLES = F;
})();
