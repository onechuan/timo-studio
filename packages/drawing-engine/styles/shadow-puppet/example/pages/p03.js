ENGINE.visual('p03', (P) => {
  P.title('算准：第三天的大雾');

  const tFog = P.cw(1, '大雾');
  const tGeng = P.cw(2, '四更');
  const tCamp = P.cw(2, '曹营');

  // night falls, then the fog thickens
  P.lamp({ keys: [[0, 1], [P.c(0, 0.2), 1], [P.c(0, 1.6), 0.6], [tFog, 0.6], [tFog + 1.2, 0.45], [P.endT, 0.45]] });

  // the moon high on the right, one thin cloud already there
  P.scenery('moon', 1460, 240, { phase: 'full', size: 170, at: 0 });
  P.scenery('cloud', 1120, 300, { size: 300, at: 0.3 });

  // layers of fog press over the moon
  P.scenery('cloud', 1600, 330, { size: 380, at: tFog - 0.3 });
  P.scenery('cloud', 1330, 320, { size: 400, at: tFog + 0.1 });
  P.scenery('cloud', 1470, 345, { size: 440, at: tFog + 0.5 });

  // the river, then the ground strip
  P.water(40, 1880, 660, { depth: 190, speed: 30, at: 0.2 });
  P.ground({ at: 0 });

  // straw boats setting out toward Cao's camp
  const sail = (x0, x1) => (lt) => PV.lerp(x0, x1, PV.clamp((lt - tCamp) / Math.max(1, P.endT - tCamp)));
  P.scenery('boat', sail(1080, 1400), 668, { size: 340, cargo: 'straw', at: tCamp - 0.5 });
  P.scenery('boat', sail(1400, 1720), 676, { size: 300, cargo: 'straw', at: tCamp - 0.2 });

  // 鲁肃 follows behind, frightened
  P.puppet(470, 850, {
    role: 'official', color: 'yellow', trim: 'blue', mask: 'open', beard: 'ink',
    face: 'r', size: 500, at: tGeng,
    pose: [[0, 'halt'], [P.c(3), 'cry']],
  });

  // 诸葛亮 watches the sky, reckons, then drinks
  P.puppet(840, 850, {
    role: 'scholar', color: 'purple', trim: 'green', mask: 'open', beard: 'ink',
    face: 'r', size: 540, at: 0,
    pose: [[0, 'stand'], [P.c(0, 0.3), 'think'], [P.c(1, 0.2), 'raise'], [tFog + 0.8, 'point'], [P.c(2), 'stand'], [P.cw(4, '饮酒'), 'proud']],
    holds: (lt) => (lt < P.cw(4, '饮酒') ? 'fan' : 'cup'),
  });

  // plaques
  P.plaque('江上大雾', 1400, 440, { size: 72, sub: '第三天夜里', at: tFog + 0.3, out: P.c(2, -0.2) });
  P.plaque('四更', 200, 380, { size: 60, vertical: true, color: 'blue', at: tGeng + 0.1 });
});
