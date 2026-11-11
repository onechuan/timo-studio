ENGINE.visual('p03', (P) => {
  // Close chart of the southern tip of South America
  P.region([-80, -62, -56, -48.5], { at: 0, dur: 3, seas: false });
  P.title('南美尽头的海峡');

  P.cartouche('南美尽头', { at: 0.8, year: 1520 });
  P.compass(undefined, { at: 1.4, r: 80 });

  // Strait waypoints, east mouth to west mouth
  const east = [-68.35, -52.35];
  const west = [-74.7, -52.7];
  const strait = [
    [-65.8, -52.0],
    east,
    [-69.4, -52.5],
    [-70.3, -52.75],
    [-70.85, -53.25],
    [-71.15, -53.75],
    [-71.4, -53.95],
    [-72.1, -53.6],
    [-72.9, -53.2],
    [-73.8, -52.85],
    west,
    [-76.6, -52.4],
  ];

  // Beat 1–2: entrance named, strait lettered along the channel
  P.place(east, { at: 1.2, kind: 'dot', label: '东口' });
  P.name('麦哲伦海峡', [-71.6, -52.95], {
    at: P.cw(0, '海峡', -0.2), size: 40, rot: -8, color: 'red',
  });

  // Beat 3: the flagship threads the winding channel, days counting up
  const t1 = P.c(1, 0.2);
  const d1 = Math.max(2.6, P.c(2) - t1 - 0.3);
  P.cam([P.push(P.c(1, 0.1), ...P.xy([-71.2, -53.2]), 1.3), P.back(P.cw(3, '平静', -0.3))]);
  P.route(strait, { at: t1, dur: d1, icon: 'ship', by: 'direct', color: 'red', size: 58, keep: true });
  P.place(west, { at: t1 + d1 * 0.85, kind: 'dot', label: '西口' });

  const lab = P.xy([-71.6, -54.6]);
  P.follow((lt) => {
    if (lt < t1) return { text: '', x: lab[0], y: lab[1], opacity: 0 };
    const k = Math.min(1, (lt - t1) / d1);
    const n = Math.max(1, Math.round(k * 38));
    return { text: n + '天', x: lab[0], y: lab[1], opacity: Math.min(1, (lt - t1) * 3) };
  }, { size: 44, color: 'red' });

  // Beat 4: one ship wrecked earlier, another turns back north to Spain
  P.place([-68.4, -50.05], {
    at: P.cw(2, '触礁', -0.3), kind: 'dot', label: '触礁', sub: '圣地亚哥号',
  });
  P.route([[-69.6, -52.55], east, [-66.2, -51.6], [-64.6, -49.4]], {
    at: P.cw(2, '掉头', -0.3), dur: 2.2, icon: 'ship', by: 'direct',
    color: 'soft', line: 'dotted', size: 50, keep: true,
  });

  // Beat 5: three ships out on the calm ocean, the ocean named
  const t3 = P.cw(3, '三条船', -0.2);
  P.token('ship', [-77.4, -51.8], { at: t3, size: 52 });
  P.token('ship', [-77.6, -53.1], { at: t3 + 0.3, size: 52 });
  P.name('太平洋', [-81.3, -51.3], { at: P.cw(3, '平静', -0.1), size: 64, sea: true });
  P.token('monster', [-79.2, -54.2], { at: P.c(4, -0.4) });
});
