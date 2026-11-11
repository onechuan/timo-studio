ENGINE.visual('p03', (P) => {
  P.title('顿悟：只练卡住的地方');

  const HERO = { hair: 'spiky', hairTone: 'black', outfit: 'school' };
  const TEACH = { hair: 'neat', hairTone: 'tone', outfit: 'suit', glasses: true };

  const R = P.grid('2x2');
  const c0 = P.c(0), c1 = P.c(1), c3 = P.c(3), c4 = P.c(4);

  // ── Panel 1 (top right): the teacher circles two bars on the score
  const r0 = R[0];
  const A = P.panel(r0, { at: 0.15 });
  A.scene('room', { at: 0.15 });
  const teacher = A.chara(r0.x + 230, r0.y + 160, 580, {
    ...TEACH, mood: 'calm', at: 0.15,
    talk: (lt) => (lt > c0 && lt < P.c(0, 2.6)) || (lt > c1 && lt < P.c(1, 2.2)),
  });
  // the score
  const sx = r0.x + 540, sy = r0.y + 70, sw = r0.w - 600, sh = r0.h - 140;
  A.box(sx, sy, sw, sh, { fill: 'paper', color: 'ink', sw: 4, at: 0.2, dur: 0.3 });
  const staffY = [sy + 50, sy + sh - 110];
  staffY.forEach((y0, k) => {
    for (let i = 0; i < 5; i++) A.line(sx + 20, y0 + i * 14, sx + sw - 20, y0 + i * 14, { color: 'ink', sw: 2, at: 0.25, dur: 0.2 });
    for (let b = 0; b <= 4; b++) {
      const bx = sx + 20 + b * (sw - 40) / 4;
      A.line(bx, y0, bx, y0 + 56, { color: 'ink', sw: 3, at: 0.25, dur: 0.1 });
    }
    const rng = PV.rng(7 + k);
    for (let n = 0; n < 12; n++) {
      const nx = sx + 40 + n * (sw - 70) / 12;
      const ny = y0 + Math.floor(rng() * 9) * 7;
      A.ellipse(nx, ny, 16, 12, { fill: 'ink', color: 'ink', at: 0.3, dur: 0.1 });
      A.line(nx + 7, ny, nx + 7, ny - 36, { color: 'ink', sw: 2, at: 0.3, dur: 0.1 });
    }
  });
  // pencil circle around the two stuck bars (bars 2–3 of the lower staff)
  const bw = (sw - 40) / 4;
  A.ring(sx + 20 + bw * 1.0 + bw, staffY[1] + 28, bw * 2 + 50, 120, { color: 'ink', sw: 5, at: P.c(0, 0.9), dur: 0.8 });
  A.balloon(r0.x + 470, r0.y + 175, '只练这两小节', { tail: teacher.mouth, at: P.c(0, 0.2), out: c1, size: 36 });
  A.balloon(r0.x + 470, r0.y + 175, '放慢，\n慢到能弹对', { tail: teacher.mouth, at: P.c(1, 0.1), out: P.c(2, -0.2), size: 36 });

  // ── Panel 2 (top left): Xiaolin listens, later resolves
  const r1 = R[1];
  const B = P.panel(r1, { at: 0.9 });
  B.scene('room', { at: 0.9 });
  B.scene('sparkle', { at: c4 });
  const hero = B.chara(r1.cx + 130, r1.y + 175, 600, {
    ...HERO, at: 0.9,
    mood: [[0, 'calm'], [c1, 'shock'], [c3, 'determined'], [c4, 'happy']],
    emote: [[0, null], [c1, 'question'], [c3, null], [c4, 'sparkle']],
  });
  P.caption(r1.x + 40, r1.y + 30, '那才是真正长本事的地方', { at: P.c(4, 0.1), size: 32, w: 360 });

  // ── Panel 3 (bottom right): the metronome is turned down, swings slowly
  const r2 = R[2];
  const C = P.panel(r2, { at: c1, tone: 'light' });
  // piano lid and keys running across the panel
  C.box(r2.x - 20, r2.y + r2.h - 90, r2.w + 40, 110, { fill: 'ink', color: 'ink', at: c1, dur: 0.1 });
  for (let k = 0; k < 22; k++) {
    const kx = r2.x + k * (r2.w / 21);
    C.box(kx, r2.y + r2.h - 70, r2.w / 21 - 4, 70, { fill: 'paper', color: 'ink', sw: 2, at: c1, dur: 0.1 });
  }
  const mx = r2.cx, mb = r2.y + r2.h - 90, mt = r2.y + 30;
  C.path(`M${mx - 120},${mb} L${mx - 45},${mt} L${mx + 45},${mt} L${mx + 120},${mb} Z`, { fill: 'paper', color: 'ink', sw: 5, at: c1, dur: 0.15 });
  for (let i = 0; i < 6; i++) {
    const ty = mt + 40 + i * 28;
    C.line(mx - 14, ty, mx + 14, ty, { color: 'ink', sw: 2, at: c1, dur: 0.1 });
  }
  const pivotY = mb - 50, L = pivotY - mt - 10;
  const phase = (u) => (u <= 0 ? u * 2.2 : u < 1 ? 2.2 * u - 0.8 * u * u : 1.4 + 0.6 * (u - 1));
  C.liveRough((lt, RR) => {
    const u = lt - c1;
    const ang = (26 * Math.PI / 180) * Math.sin(2 * Math.PI * phase(u));
    const wpos = 0.35 + 0.4 * PV.K(lt, c1 + 0.2, 0.8);
    const ex = mx + Math.sin(ang) * L, ey = pivotY - Math.cos(ang) * L;
    const wx = mx + Math.sin(ang) * L * wpos, wy = pivotY - Math.cos(ang) * L * wpos;
    return [
      RR.line(mx, pivotY, ex, ey, { color: 'ink', sw: 6 }),
      RR.box(wx - 20, wy - 14, 40, 28, { fill: 'ink', color: 'ink' }),
      RR.circle(mx, pivotY, 18, { fill: 'ink', color: 'ink' }),
    ];
  }, { at: c1 });
  // a hand-drawn swing arc to show the slow beat
  C.path(`M${mx - 170},${mt + 90} Q${mx},${mt + 10} ${mx + 170},${mt + 90}`, { color: 'ink', sw: 3, at: P.c(1, 1.0), dur: 0.4 });

  // ── Panel 4 (bottom left): the comfort-zone boss, cracking
  const r3 = R[3];
  const D = P.panel(r3, { at: P.c(1, 1.3), tone: 'black' });
  D.aura(r3.cx, r3.y + 190, 210, { color: 'paper', at: P.c(1, 1.3), out: c3 });
  D.boss(r3.cx, r3.y + 140, 430, {
    label: '舒适区魔王', at: P.c(1, 1.3),
    mood: [[0, 'menace'], [c3, 'hit']],
    defeat: P.c(4, 0.5),
  });
  D.menace(r3.x + r3.w - 170, r3.y + 30, { size: 80, side: 'left', at: P.c(1, 1.5), out: c3 });
  D.sfx(r3.x + 190, r3.y + 120, 'ピシッ', { size: 130, style: 'white', at: P.c(3, 0.2) });

  // ── The realisation splash
  P.realize({
    at: P.cw(2, '原来'),
    chara: { ...HERO, mood: 'shock' },
    side: 'left',
    sfx: 'ドン',
    spot: true,
    line: '进步发生在学习区',
    out: P.c(3, -0.15),
  });

  P.cam([P.push(P.c(3, 0.1), r3.cx, r3.cy, 1.2), P.back(c4)]);
});
