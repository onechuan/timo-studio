ENGINE.visual('p05', (P) => {
  P.title('收场：十万多支箭');

  const tSigh = P.cw(2, '长叹');
  const tTurn = P.c(3, 0.2);
  const tBow = P.c(4, 0.3);

  // the fog lifts: lamp from dim to full, then down at the curtain
  P.lamp({ keys: [[0, 0.5], [P.c(0, 0.2), 0.5], [P.c(0, 1.6), 1], [P.c(4, 0.4), 1], [11.7, 0]] });

  // set: the river on the left, the rising sun on the right
  P.scenery('sun', 1620, 250, { at: P.c(0, 0.3) });
  P.water(-80, 860, 770, { at: 0, depth: 140, speed: 30 });

  // a straw boat full of arrows comes in to shore and stops
  const bx0 = -200, bx1 = 450, bt0 = 0.1, bt1 = P.c(1, 0.2);
  P.scenery('boat', lt => PV.lerp(bx0, bx1, PV.ease ? PV.ease.out(PV.clamp((lt - bt0) / (bt1 - bt0))) : PV.clamp((lt - bt0) / (bt1 - bt0))), 790,
    { cargo: 'straw', size: 560, at: 0, enter: 'cut' });

  P.ground({ x0: 820, x1: 2000, at: 0 });

  // 诸葛亮: purple robe, feather fan
  P.puppet(980, 850, {
    role: 'scholar', color: 'purple', trim: 'green', mask: 'open', beard: 'ink', holds: 'fan',
    face: lt => (lt < tTurn ? 'r' : 'l'),
    pose: [[0, 'stand'], [P.c(1, 0.1), 'point'], [P.c(2), 'stand'], [tTurn, 'proud'], [tBow, 'bow']],
    at: 0.6,
  });

  // 周瑜: red robe general
  P.puppet(1460, 850, {
    role: 'general', color: 'red', trim: 'yellow', mask: 'open', holds: 'sword',
    face: 'l',
    pose: [[0, 'stand'], [P.c(1, 0.5), 'halt'], [tSigh, 'sad'], [tBow, 'bow']],
    at: 1.0,
  });

  // the count
  P.plaque('十万多支箭', 560, 300, { size: 80, color: 'red', at: P.c(1, 0.6), out: P.c(3) });

  // what it means
  P.plaque('天时与人心', 620, 250, { size: 76, color: 'purple', sub: '算准天时 · 算准多疑', at: P.c(3, 0.4), out: P.c(4, 1.6) });
});
