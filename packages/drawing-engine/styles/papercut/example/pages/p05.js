ENGINE.visual('p05', (P) => {
  P.ground('night', { hills: true, seed: 5 });
  P.title('红灯笼：把团圆点亮');

  // the eave of the house, deep red so the lanterns read apart from it
  P.cutout([[860, 236], [905, 196], [2010, 196], [2010, 252], [905, 252]],
    { sharp: true, cuts: 'saw', color: 'deep', enter: 'paste', at: 0 });

  // beat 1 — a pair of big lanterns drop from the eave and sway
  P.motif('lantern', 1010, 395, 285, { enter: 'drop', sway: 5, at: P.c(0, 0.1) });
  P.motif('lantern', 1680, 395, 285, { enter: 'drop', sway: 4, at: P.c(0, 0.45) });

  // beat 2 — a string of lanterns along the eave, lit one by one up to 正月十五
  const lit = P.cw(1, '正月十五');
  P.lanterns(1170, 1520, 262, 4, { at: P.c(1, 0), size: 120, lit: lit });
  const xs = [1170, 1287, 1403, 1520];
  xs.forEach((x, i) => P.glow(x, 330, 130, { at: P.c(1, 0.5) + i * 0.4, strength: 0.6, flicker: true }));
  P.glow(1010, 400, 220, { at: lit, strength: 0.55, flicker: true });
  P.glow(1680, 400, 220, { at: lit + 0.2, strength: 0.55, flicker: true });
  P.banner('正月十五', 170, 230, { size: 56, at: lit, enter: 'drop' });

  // beat 3 — a folded paper chain opens into a family of five holding hands
  const tuan = P.cw(2, '团圆');
  P.glow(990, 740, 460, { at: P.c(2, 0.3), strength: 0.5 });
  P.strip('child', 5, 560, 872, 210, { at: P.c(2, 0.1), every: 0.3, size: 300 });
  P.word('团圆', 310, 560, { size: 170, at: tuan, stagger: 0.2 });
});
