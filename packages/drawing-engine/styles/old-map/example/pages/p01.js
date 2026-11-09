ENGINE.visual('p01', (P) => {
  P.title('五条船出发，一条船回来', { accent: 'red' });

  // the plate: the whole world
  P.region([-180, 180, -58, 64], { at: 0, dur: 3 });

  // the cartouche with the year rolling 1519 → 1522
  const tYear = P.cw(1, '18', -0.2);
  P.cartouche('麦哲伦环球航行', { at: 0.6, years: [[0.6, 1519], [tYear, 1522]], sub: '五船出发 · 三年' });

  // Spain, the port of departure and return
  P.place([-6.0, 37.4], { kind: 'port', label: '西班牙', color: 'red', at: 0.9 });

  // five ships riding at anchor off Spain
  const tFive = P.cw(0, '五条船', -0.3);
  const anchor = [[-11.5, 38.6], [-14.5, 36.8], [-11.0, 35.4], [-17.5, 38.2], [-15.0, 33.8]];
  const ships = anchor.map((p, i) => P.token('ship', p, { at: tFive + i * 0.18, size: 44, flip: true }));
  // they sail off: the moment the narration turns to the return
  ships.forEach((s, i) => { if (s && s.hide) s.hide(P.c(1, 0.1 + i * 0.08), 0.6); });

  // one ship comes home from the east, round Africa
  const tOne = P.cw(1, '一条船', -0.4);
  P.route(['Cape of Good Hope', [-24, 15], [-9.5, 36.5]], {
    at: tOne, dur: 2.6, icon: 'ship', color: 'red', line: 'dashed', size: 56,
  });

  // 18 men
  const [sx, sy] = P.xy([-6.0, 37.4]);
  P.text('{r:18人}', { x: sx - 230, y: sy + 70, size: 40, at: tYear, cps: 10 });

  // the whole loop: west across the Atlantic, through the strait, over the Pacific
  const tLoop = P.c(2, 0.1);
  P.route([[-9.5, 36.5], [-30, 5], [-43.2, -24], [-70.5, -53.5], [-110, -30], [-179.5, -12]], {
    at: tLoop, dur: 1.5, icon: 'none', arrow: false, color: 'red', line: 'dashed',
  });
  P.route([[179.5, -6], [144.8, 13.4], [123.9, 10.3], [127.4, 0.7], [125, -10], [100, -25], 'Cape of Good Hope'], {
    at: tLoop + 1.5, dur: 1.4, icon: 'none', arrow: false, color: 'red', line: 'dashed',
  });
  P.place([127.4, 0.7], { kind: 'dot', label: '香料群岛', at: tLoop + 2.1 });

  // ornaments on the open sea
  P.compass(undefined, { at: 1.4, r: 80 });
  P.token('monster', undefined, { at: 2.2 });
});
