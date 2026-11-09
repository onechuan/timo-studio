ENGINE.visual('p02', (P) => {
  P.title('从头弹到尾', { at: 0 });
  const R = P.grid('1+2');
  const LOOK = { hair: 'spiky', hairTone: 'black', outfit: 'school' };

  // ── Panel 0: 小林 at the piano (big, right) ──
  const r0 = R[0];
  const A = P.panel(r0, { at: 0.1 });
  A.scene('room', { at: 0.1 });
  A.tone(r0.x - 20, r0.y - 20, r0.w + 40, r0.h + 40, { kind: 'fade', dir: 'down', at: P.c(3) });
  const kid = A.chara(r0.cx, r0.y + r0.h * 0.36, 660, {
    ...LOOK,
    mood: [[0, 'smug'], [P.c(3), 'despair']],
    emote: [[0, 'sparkle'], [P.c(3), 'gloom']],
    look: [[0, 0], [P.c(1), 0.3], [P.c(3), 0]],
    at: 0.1,
  });
  // piano keyboard in front of him
  const kx = r0.x - 20, kw = r0.w + 40, ky = r0.y + r0.h - 150;
  A.rect(kx, ky, kw, 170, { fill: 'paper', color: 'ink', sw: 5, at: 0.1, dur: 0.01 });
  const nk = 16, kwid = kw / nk;
  for (let i = 1; i < nk; i++) {
    A.line(kx + i * kwid, ky, kx + i * kwid, ky + 170, { color: 'ink', sw: 3, at: 0.1, dur: 0.01 });
    if ([1, 2, 4, 5, 6].includes(i % 7)) {
      A.rect(kx + i * kwid - kwid * 0.3, ky, kwid * 0.6, 95, { fill: 'ink', color: 'ink', sw: 2, at: 0.1, dur: 0.01 });
    }
  }
  A.balloon(r0.x + r0.w * 0.2, r0.y + r0.h * 0.3, '这段\n我最熟～', {
    kind: 'think', tail: kid.mouth, at: P.c(0, 0.9), out: P.c(3),
  });
  A.caption(r0.x + 170, r0.y + 40, '感觉很努力，水平却不动。', { at: P.cw(4, '感觉'), w: 560 });

  // ── Panel 1: the score, two hard bars swept past ──
  const r1 = R[1];
  const B = P.panel(r1, { at: 1.4 });
  const sx = r1.x + 70, sw = r1.w - 140;
  const staffs = [r1.y + r1.h * 0.3, r1.y + r1.h * 0.66];
  const gapL = 18;
  const rng = PV.rng(22);
  // hard bars: last two bars of the second staff, toned
  const barW = sw / 4;
  const hx = sx + barW * 2, hy = staffs[1] - 40;
  B.tone(hx, hy, barW * 2, gapL * 4 + 80, { kind: 'mid', at: 1.4 });
  staffs.forEach((y0, s) => {
    for (let l = 0; l < 5; l++) B.line(sx, y0 + l * gapL, sx + sw, y0 + l * gapL, { color: 'ink', sw: 2.5, at: 1.4, dur: 0.01 });
    for (let b = 0; b <= 4; b++) B.line(sx + b * barW, y0, sx + b * barW, y0 + 4 * gapL, { color: 'ink', sw: 3, at: 1.4, dur: 0.01 });
    for (let b = 0; b < 4; b++) {
      const hard = s === 1 && b >= 2;
      const n = hard ? 8 : 4;
      for (let k = 0; k < n; k++) {
        const nx = sx + b * barW + barW * (k + 0.6) / (n + 0.2);
        const ny = y0 + Math.floor(rng() * 9) * (gapL / 2) - (hard ? gapL : 0);
        B.circle(nx, ny, 17, { fill: 'ink', color: 'ink', at: 1.4, dur: 0.01 });
        B.line(nx + 8, ny, nx + 8, ny - 52, { color: 'ink', sw: 3, at: 1.4, dur: 0.01 });
      }
    }
  });
  B.speedlines({ angle: 0, n: 130, at: P.cw(1, '一带而过', -0.2) });
  B.sfx(hx + barW, r1.y + r1.h * 0.2, '一带而过', { font: 'brush', size: 110, at: P.cw(1, '一带而过') });

  // ── Panel 2: the comfort-zone boss ──
  const r2 = R[2];
  const C = P.panel(r2, { at: P.c(2, -0.3), tone: 'black' });
  const bx = r2.cx + 40, by = r2.y + r2.h * 0.32;
  C.aura(bx, by + 40, 230, { color: 'paper', at: P.c(2, -0.3) });
  C.boss(bx, by, 330, {
    label: '舒适区魔王', at: P.c(2, -0.3), from: 'rise',
    mood: [[0, 'menace'], [P.c(3), 'laugh']],
  });
  C.menace(r2.x + 70, r2.y + 50, { size: 80, side: 'right', at: P.cw(2, '舒适区') });

  // despair hit
  P.sfx(r0.x + r0.w * 0.78, r0.y + r0.h * 0.62, 'ズーン', { size: 150, dir: 'down', at: P.c(3, 0.2) });

  P.cam([
    P.push(P.cw(2, '舒适区'), r2.cx, r2.cy, 1.2),
    P.back(P.c(3)),
    P.push(P.c(4, 0.3), r0.cx, r0.cy, 1.1),
  ]);
});
