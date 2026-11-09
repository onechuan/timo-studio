ENGINE.visual('p02', (P) => {
  const SAN = [-6.35, 36.78];      // 桑卢卡尔
  const CAN = [-15.5, 28.1];       // 加那利群岛
  const RIO = [-43.2, -22.9];      // 里约
  const SJU = [-67.7, -49.3];      // 圣胡利安

  P.title('横渡大西洋');
  P.region([SAN, CAN, RIO, SJU, [-75, -52], [-5, 40]], { at: 0, dur: 3 });
  P.compass(null, { at: 0.3, r: 90 });
  P.cartouche('麦哲伦船队', { at: 1.2, year: 1519, sub: '向西，再向南' });

  // leg 1: Sanlúcar → Canaries → Rio
  const t1 = P.c(0, 0.5);
  const tRio = Math.max(P.cw(1, '巴西', 0.2), t1 + 4);
  P.place(SAN, { at: P.c(0, 0.4), kind: 'port', label: '桑卢卡尔', color: 'red' });
  P.route([SAN, CAN, RIO], { at: t1, dur: tRio - t1, icon: 'ship', color: 'red', keep: false });
  P.place(CAN, { at: P.cw(1, '加那利', -0.2), kind: 'dot', label: '加那利群岛' });
  P.place(RIO, { at: tRio - 0.3, kind: 'port', label: '里约' });

  // leg 2: down the coast to San Julián
  const t2 = Math.max(P.c(2, 0.2), tRio + 0.3);
  const t2e = Math.min(P.endT - 0.6, t2 + 4.2);
  P.route([RIO, SJU], { at: t2, dur: t2e - t2, icon: 'ship', color: 'red', keep: true });
  P.place(SJU, { at: t2e - 0.3, kind: 'port', label: '圣胡利安', color: 'red' });
  P.token('monster', [-20, -42], { at: 2.0 });

  const mid = P.xy([-55, -32]);
  P.cam([P.push(P.c(2, 0.1), mid[0], mid[1], 1.15)]);
});
