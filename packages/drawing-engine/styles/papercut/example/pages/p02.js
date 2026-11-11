ENGINE.visual('p02', (P) => {
  P.ground('night', { hills: true, seed: 2 });
  P.title('为什么是红');

  const c1 = P.c(1), c2 = P.c(2), c3 = P.c(3), c4 = P.c(4);
  const hit = P.cw(1, '红色');
  const bang = P.cw(2, '鞭炮');

  // the house with its door — the people's side
  P.motif('house', 500, 600, 520, { color: 'deep', at: 0.05, enter: 'paste' });

  // the beast 年 walks out from behind the hills, stops at the red, backs off, then flees
  const K = PV.K;
  P.animal('tiger', 1400, 610, 600, {
    color: 'pale', face: 'l', at: 0.15, enter: 'paste', hop: 8,
    move: (lt) => {
      const inP = K(lt, 0.2, Math.max(1, hit - 0.4), 'out');
      const back = K(lt, hit + 0.25, 0.7, 'out');
      const flee = K(lt, bang + 0.3, 1.1, 'inOut');
      return [650 * (1 - inP) + 140 * back + 900 * flee, 0];
    },
  });

  // red paper slapped on the door
  P.word('福', 500, 640, { size: 130, card: 'diamond', color: 'red', at: hit, enter: 'paste' });
  const fear = P.banner('怕红', 1180, 230, { size: 56, at: hit + 0.2, enter: 'drop' });
  fear.hide(c3, 0.3);

  // a string of firecrackers bursts
  const fc = P.motif('firecracker', 930, 430, 300, { color: 'red', at: bang - 0.5, enter: 'drop', sway: 5 });
  P.fireworks([
    [860, 330, 70, bang + 0.1],
    [1010, 290, 60, bang + 0.3],
    [930, 560, 80, bang + 0.5],
  ], { colors: ['red', 'pale', 'cream'] });
  P.scraps({ kind: 'confetti', at: bang, count: 50 });
  fc.hide(c4 - 0.1, 0.3);

  // every household follows: windows light up in red, lanterns lit
  [1170, 1430, 1690].forEach((x, i) => {
    P.motif('house', x, 720, 200, { color: 'red', at: P.cw(3, '红纸') + i * 0.35, enter: 'paste' });
    P.glow(x, 730, 150, { at: P.cw(3, '红纸') + i * 0.35 + 0.2, strength: 0.55, flicker: true });
  });
  P.glow(1440, 720, 420, { at: P.cw(3, '红纸', 0.6), strength: 0.5, flicker: true });
  P.lanterns(1100, 1760, 200, 4, { at: P.cw(3, '灯火') - 0.3, lit: P.cw(3, '灯火') + 0.3, size: 110 });

  // the conclusion: red becomes the colour of the new year
  P.word('红', 930, 420, { size: 220, color: 'gold', at: c4 + 0.1, glow: c4 + 0.8 });

  // camera: start close on door and beast, pull back as the whole village turns red
  P.cam([
    { at: 0, x: 900, y: 560, s: 1.12, dur: 0.01 },
    P.back(c3 + 0.2),
  ]);
});
