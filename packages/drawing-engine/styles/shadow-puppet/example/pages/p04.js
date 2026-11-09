ENGINE.visual('p04', (P) => {
  P.title('借箭：曹操自己送箭');

  const tTurn = P.cw(4, '调个头');
  const tOff = tTurn + 2.6;          // lifted figure leaves
  const tFill = tOff + 0.1;          // other side fills with arrows

  // fog on the river: lamp half-lit, the answer brings it back
  P.lamp({ keys: [[0, 0.72], [P.c(5), 0.72], [P.c(5, 0.8), 1]] });

  // set pieces
  P.scenery('tent', 1700, 846, { size: 300, at: 0.1 });
  P.water(60, 1220, 760, { depth: 130, speed: 30, at: 0 });
  P.scenery('boat', 860, 800, { cargo: 'straw', size: 560, at: 0.2 });
  P.scenery('drum', 650, 770, {
    size: 130, at: 0.4,
    rock: (lt) => (lt > P.c(0) && lt < P.c(1)) ? Math.sin(lt * 26) * 6 : 0,
  });
  P.ground({ x0: 1200, x1: 1860, at: 0 });

  // 诸葛亮 on the boat — the lifted figure at the turn
  P.puppet(880, 770, {
    role: 'scholar', color: 'purple', trim: 'yellow', mask: 'open', holds: 'fan',
    size: 480, face: 'r', at: 0.6, out: tOff,
    pose: [[0, 'stand'], [P.c(0, 0.3), 'raise'], [P.c(2), 'think'], [P.c(3, 0.5), 'proud'], [tTurn, 'raise']],
    lift: (lt) => PV.clamp((lt - tTurn) / 1.5) * 0.9,
  });

  // 曹操 in his water camp
  P.puppet(1360, 850, {
    role: 'general', color: 'blue', trim: 'yellow', mask: 'white', beard: 'ink',
    size: 500, face: 'l', at: 1.2,
    pose: [[0, 'think'], [P.cw(1, '埋伏'), 'halt'], [P.cw(2, '放箭'), 'point'], [P.c(5), 'angry']],
  });

  // archers
  P.troupe('soldier', 4, 1480, 1740, 850, {
    size: 280, color: 'blue', holds: 'bow', face: 'l', at: P.c(2, 0.4),
    pose: [[0, 'stand'], [P.cw(2, '放箭'), 'fight']],
  });

  // volleys of arrows flying across the river (stop before the turn)
  const vStart = P.cw(2, '放箭') + 0.2, vEnd = tTurn - 0.3;
  for (let k = 0; k < 9; k++) {
    const t0 = vStart + k * 0.55, fl = 0.9;
    if (t0 + fl > vEnd) break;
    const ty = 640 + (k % 3) * 35;
    P.prop('arrow', (lt) => PV.lerp(1500, 1000, PV.clamp((lt - t0) / fl)), (lt) => {
      const u = PV.clamp((lt - t0) / fl);
      return PV.lerp(560, ty, u) - Math.sin(u * Math.PI) * 70;
    }, {
      size: 1, rot: 90, rod: false, at: t0, out: t0 + fl,
    });
  }

  // arrows stuck in the straw — first side (facing 曹营)
  const stuck = [[1000, 680], [1040, 700], [960, 705], [1080, 690], [920, 690], [1010, 725], [1060, 725], [970, 670]];
  stuck.forEach(([x, y], k) => {
    P.prop('arrow', x, y, { size: 0.9, rot: 90, rod: false, at: P.c(3) + k * 0.22 });
  });
  // after the boat turns: the other side fills too
  const stuck2 = [[700, 690], [740, 705], [660, 700], [780, 685], [720, 725], [680, 670]];
  stuck2.forEach(([x, y], k) => {
    P.prop('arrow', x, y, { size: 0.9, rot: 90, rod: false, at: tFill + k * 0.15 });
  });

  // plaques
  P.plaque('怕有埋伏', 1620, 260, { size: 60, at: P.cw(1, '埋伏'), out: P.c(3) - 0.2 });
  P.plaque((lt) => Math.round(PV.clamp((lt - P.c(3)) / (tTurn - P.c(3) - 0.4)) * 50000) + ' 支', 500, 370, {
    size: 64, sub: '扎进稻草', at: P.c(3), out: tTurn - 0.2,
  });
  P.plaque('曹操送箭', 960, 270, { size: 76, sub: '十万余支', at: P.c(5, 0.2) });

  // one push onto the straw full of arrows
  P.cam([P.push(P.c(3, 0.3), 900, 640, 1.12), P.back(tTurn - 0.5)]);
});
