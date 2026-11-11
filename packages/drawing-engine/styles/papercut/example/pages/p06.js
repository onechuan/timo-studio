ENGINE.visual('p06', (P) => {
  P.ground('night', { hills: true, border: true, seed: 6 });
  P.title('一扇亮着的窗');

  const tFlower = P.cw(0, '窗花', -0.3);
  const tFu = P.cw(0, '倒福');
  const t2009 = P.cw(1, '2009', -0.2);
  const tLight = P.c(2, 0.1);

  // 红色驱邪 — lanterns already hanging as the page turns in
  P.lanterns(200, 700, 200, 3, { at: 0.05, size: 120, lit: P.c(0, 0.6) });

  // 窗花许愿 — the big window flower, made in front of us
  const fl = P.flower(1010, 540, 290, {
    fold: 12, seed: 61, centre: '春', at: tFlower,
    glow: tLight, glowR: 1.3, project: [1010, 860, 760, 70],
  });

  // 倒福讨口彩 — the upside-down 福, the one gold accent
  P.motif('fu', 1580, 770, 250, { flip: true, color: 'gold', at: tFu, enter: 'drop', sway: 4 });

  // fireworks burst over the window
  P.fireworks([
    [1450, 250, 80, tFu + 0.6],
    [1700, 300, 65, tFu + 1.1],
    [1580, 220, 55, P.c(1, 0.6)],
    [1430, 280, 70, tLight + 0.5],
    [1720, 240, 85, tLight + 1.0],
  ], { colors: ['red', 'pale', 'red'] });

  // 2009 — a paper-cut strip drops beside the window
  P.banner('2009年非遗', 560, 300, { vertical: true, size: 52, enter: 'drop', at: t2009 });

  // 自己剪一张 — a child opens out, cheering
  P.figure('child', 300, 860, 400, { pose: 'raise', at: P.cw(2, '自己', -0.3), hop: 8 });

  // 过年好
  P.banner('过年好', 1440, 770, { size: 56, at: tLight + 0.6 });

  // camera: start close on the window, pull back to the whole picture
  P.cam([P.push(0, 1010, 540, 1.15), P.back(P.cw(0, '倒福', -0.4))]);
});
