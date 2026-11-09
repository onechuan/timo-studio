ENGINE.visual('p02', (P) => {
  P.title('拆开：五个部件');
  const S = P.reveal('turbofan', {
    at: 0,
    turn: false,
    explode: P.cw(0, '拆开', -0.1),
    spin: 'fan',
    labels: {
      fan: P.cw(1, '风扇', -0.1),
      compressor: P.cw(1, '压气机', -0.1),
      combustor: P.cw(2, '燃烧室', -0.1),
      turbine: P.cw(2, '涡轮', -0.1),
      nozzle: P.cw(2, '尾喷口', -0.1),
    },
    flow: ['fan', 'nozzle', P.c(3, 0.1)],
    labelSide: 'both',
  });
  // gentle drift so the product never stands still, then slow push and pull back
  S.turn(0.3, 12);
  S.dolly(P.c(1, 0.1), 1.12);
  S.dolly(P.c(3, 0.1), 0.96);
  P.tag(160, 820, '五站 · 每站只干一件事', { at: P.cw(3, '五站', 0.2), hot: true });
});
