ENGINE.visual('p01', (P) => {
  P.ground('night', { hills: true, snow: true, seed: 11 });
  P.title('一张红纸里的年俗');

  // c0: scissors slit the night sky open
  P.scissors([[60, 250], [700, 210], [1300, 240], [1860, 200]], { at: 0.25, dur: 1.6, size: 150 });

  // c1: folded wedge cut and unfolded into the hero window flower
  P.flower(1170, 520, 300, { at: P.c(1, 0), fold: 12, seed: 7, centre: '春', spin: 2 });

  // supporting pieces named in c1
  P.motif('fu', 460, 390, 250, { at: P.cw(1, '倒福'), flip: true });
  P.motif('lantern', 1650, 470, 300, { at: P.cw(1, '红灯笼'), sway: 4 });

  // c2: the banner "一张红纸" pasted beside the flower
  P.banner('一张红纸', 210, 590, { size: 72, at: P.cw(2, '红纸', -0.2) });

  // c3: the question
  P.banner('为什么偏偏是红？', 210, 740, { size: 44, at: P.c(3, 0.2), enter: 'drop' });

  P.cam([
    P.push(P.c(2, 0.1), 860, 560, 1.08),
    P.back(P.c(3, 0.1)),
  ]);
});
