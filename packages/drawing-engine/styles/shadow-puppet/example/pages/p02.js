ENGINE.visual('p02', (P) => {
  P.title('准备：二十条草船');

  const tArrive = 1.9;
  P.lamp({ keys: [[0, 1], [P.c(4), 1], [P.c(4, 0.8), 0.72]] });

  // set: distant mountain behind the river, the river on the right
  P.scenery('mountain', 1700, 700, { size: 420, peak: 220, at: 0 });
  P.scenery('tree', 170, 850, { type: 'willow', size: 300, at: 0 });
  P.water(880, 1860, 700, { depth: 150, speed: 40, at: 0.1 });
  P.ground({ x0: 40, x1: 900, at: 0 });

  // plain boats, then swapped for straw-loaded boats on 稻草
  const tStraw = P.cw(2, '稻草');
  P.scenery('boat', 1170, 780, { size: 460, at: 0.3, out: tStraw });
  P.scenery('boat', 1610, 780, { size: 460, at: 0.5, out: tStraw + 0.15 });
  P.scenery('boat', 1170, 780, { size: 460, cargo: 'straw', at: tStraw });
  P.scenery('boat', 1610, 780, { size: 460, cargo: 'straw', at: tStraw + 0.25 });

  // 鲁肃: yellow official walks to the river bank and bows
  P.puppet(lt => PV.lerp(560, 840, PV.clamp((lt - 0.3) / (tArrive - 0.3))), 850, {
    role: 'official', color: 'yellow', trim: 'green', mask: 'open', beard: 'ink',
    size: 500, at: 0.2,
    face: lt => (lt < tArrive ? 'r' : 'l'),
    pose: [[0, 'walk'], [tArrive, 'bow'], [P.c(2), 'stand'], [P.c(4, 0.2), 'present']],
  });

  // 诸葛亮: purple scholar with feather fan
  const t20 = P.cw(1, '20条');
  P.puppet(400, 850, {
    role: 'scholar', color: 'purple', trim: 'yellow', mask: 'open', beard: 'ink',
    holds: 'fan', size: 540, at: 1.3, face: 'r',
    pose: [[0, 'stand'], [t20, 'point'], [P.c(2, 1.2), 'think'], [P.c(4, 0.3), 'proud']],
  });

  P.plaque('二十条小船', 1380, 250, { size: 72, color: 'yellow', at: t20, out: P.c(3, -0.3) });

  // soldiers march onto the boats
  const t30 = P.cw(3, '30名');
  P.troupe('soldier', 5, 1000, 1500, 700, {
    size: 260, color: 'red', trim: 'blue', face: 'r', holds: 'spear',
    at: P.c(3, -0.1),
    march: lt => 220 * PV.clamp((lt - P.c(3)) / 1.5),
    walk: lt => lt > P.c(3) && lt < P.c(3, 1.5),
  });
  P.plaque('每船三十人', 1380, 250, { size: 72, color: 'red', at: t30 });
});
