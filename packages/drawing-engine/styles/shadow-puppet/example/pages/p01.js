ENGINE.visual('p01', (P) => {
  P.title('难题：十天造十万支箭');
  P.lamp();   // the lamp comes up on a dark screen
  // set: army camp
  P.scenery('tent', 330, 850, { size: 460, at: 0.2 });
  P.scenery('drum', 1640, 850, { size: 220, at: 0.5 });
  P.ground({ at: 0 });
  // Zhuge Liang — purple scholar with the feather fan (left, facing right)
  P.puppet(660, 850, { role: 'scholar', color: 'purple', trim: 'green', mask: 'open', beard: 'ink', face: 'r', size: 520, at: 1.4,
    holds: (lt) => (lt < P.c(3) ? 'fan' : 'scroll'),
    pose: [[0, 'stand'], [P.c(1, 0.6), 'think'], [P.cw(2, '只要'), 'raise'], [P.c(3), 'present'], [P.c(4), 'proud']] });
  // Zhou Yu — red general, walks in from the right and points
  const zx0 = 1720, zx1 = 1260, zt0 = 0.9, zdur = 2.2;
  P.puppet((lt) => PV.lerp(zx0, zx1, PV.clamp((lt - zt0) / zdur)), 850, { role: 'general', color: 'red', trim: 'yellow', mask: 'open', size: 540, at: zt0,
    face: (lt) => (lt < P.c(4) ? 'l' : 'r'), holds: 'sword',
    pose: [[0, 'walk'], [zt0 + zdur, 'point'], [P.c(3), 'angry'], [P.c(4), 'think']] });
  // plaques: one at a time, upper cloth
  P.plaque('十万支箭', 960, 290, { size: 72, sub: '限期十天', color: 'red', at: P.c(1, 0.1), out: P.c(2, 0.2) });
  P.plaque('只要三天', 960, 290, { size: 72, sub: '立下军令状', color: 'purple', at: P.cw(2, '只要', 0.1), out: P.c(4) });
  P.plaque('怎么可能', 960, 290, { size: 76, color: 'red', at: P.cw(4, '怎么', -0.2), out: P.endT + 0.4 });
  // camera: one push onto Zhou Yu's anger, then back
  P.cam([P.push(P.c(3), 1150, 520, 1.12), P.back(P.c(4, 0.5))]);
});
