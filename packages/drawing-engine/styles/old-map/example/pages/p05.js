ENGINE.visual('p05', (P) => {
  P.title('一条船，一整圈');
  P.region('world', { at: 0, dur: 3 });

  const ES = [-6.35, 36.8];      // Sanlúcar de Barrameda
  const MOL = [127.4, 0.7];      // Moluccas (Tidore)
  const CAPE = [18.5, -34.6];

  // the voyage already sailed (pages 1–4), laid in faint dotted ink
  P.route([ES, [-17, 14], [-35, -8], [-43, -23], [-66, -45], [-70, -53]],
    { at: 0.5, dur: 1.4, icon: 'none', arrow: false, line: 'dotted', w: 2.4, color: 'red', by: 'sea' });


  // Victoria sails home: Indian Ocean → Cape of Good Hope → Spain
  const tCape = P.cw(0, '好望角');
  const tSpain = P.cw(1, '西班牙');
  P.place(MOL, { at: 0.8, label: '香料群岛', kind: 'port' });
  P.route([MOL, [105, -10], [60, -30], CAPE, [10, -20], [-18, 10], [-15, 30], ES],
    { at: 0.9, dur: tSpain - 0.9, icon: 'ship', line: 'solid', w: 3.4, color: 'red', size: 58, by: 'sea' });
  P.place(CAPE, { at: tCape - 0.2, label: '好望角', color: 'ink' });
  P.place(ES, { at: tSpain - 0.3, label: '西班牙', sub: '18人', kind: 'port', color: 'red', side: 'l' });
  P.route([[-76, -50], [-120, -25], [-174, -6]],
    { at: 1.0, dur: 1.0, icon: 'none', arrow: false, line: 'dotted', w: 2.4, color: 'red', by: 'direct' });
  P.route([[174, 6], [145, 12], MOL],
    { at: 1.4, dur: 0.8, icon: 'none', arrow: false, line: 'dotted', w: 2.4, color: 'red', by: 'direct' });

  P.cartouche('维多利亚号', {
    at: 0.6,
    years: [[0.6, 1521], [P.cw(1, '1522', -0.4), 1522]],
    sub: '第一次环球航行',
  });

  P.compass([-25, -48], { at: 1.2, r: 70 });
  P.token('monster', [-140, -35], { at: 1.8 });


});
