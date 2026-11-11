ENGINE.visual('p04', (P) => {
  P.title('燃烧：空气和燃油一起烧');

  const tBurn = P.cw(1, '燃烧室', -0.2);
  const t1500 = P.cw(3, '1500', -1.2);

  const S = P.studio({ model: 'turbofan', at: 0, box: [660, 190, 1100, 680], labelSide: 'top', yaw: -28, pitch: 12 });

  // c0: cut the assembled engine open
  S.turn(0.3, 20)
    .section(P.c(0, 0.4), { cut: 'quarter' });
  P.headline(170, 230, '剖面', { at: P.c(0, 0.6), size: 64 });

  // c1: squeezed air enters the combustor; it lights up orange, camera pushes in
  S.flow('compressor', 'combustor', { at: P.c(1, 0.1), color: 'blue' })
    .highlight('combustor', tBurn + 0.3)
    .camera([
      { at: P.c(1, 0.4), zoom: 1.2, focus: 'combustor' },
      { at: P.c(3, 0), zoom: 1.3, focus: 'combustor' },
    ]);

  // c2: fuel sprayed in, burning continuously
  S.label('combustor', '燃烧室', { at: tBurn, sub: '燃油喷入 · 持续燃烧', side: 'top' });

  // c3: temperature counts up to 1500
  P.spec(170, 310, 1500, { at: t1500, dur: 1.2, unit: '℃', size: 96, prefix: '>' });

  // c4: gas expands and rushes backwards
  S.flow('combustor', 'nozzle', { at: P.c(4, 0), color: 'blue' })
    .label('nozzle', '尾喷口', { at: P.cw(4, '往后', -0.2), sub: '高速向后', side: 'bottom' });
  P.headline(170, 760, '体积猛涨，往后冲', { at: P.cw(4, '猛涨', -0.2), size: 56 });
});
