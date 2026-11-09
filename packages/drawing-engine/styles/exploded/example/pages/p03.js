ENGINE.visual('p03', (P) => {
  P.title('压缩：一级级挤紧');

  const t40 = P.cw(3, '40倍', 0);
  const S = P.studio({ model: 'turbofan', at: 0, box: [640, 190, 1120, 680], labelSide: 'right' });

  // c0 — fan spins, blue air drawn in, slow push
  S.spin('fan', { at: 0.2, speed: 260 })
    .section(0.3, { cut: 'quarter' })
    .flow('fan', 'compressor', { at: P.c(0, 0.6), color: 'blue' })
    .label('fan', '风扇', { at: P.cw(0, '风扇', -0.2), sub: '吸入大口空气' })
    .camera([
      { at: 0.3, zoom: 1.12 },
      { at: P.c(1, 0.2), zoom: 1.7, focus: 'compressor' },
    ]);

  // c1 — compressor glows orange, others glassy
  S.highlight('compressor', P.cw(1, '压气机', -0.2))
    .label('compressor', '压气机', { at: P.cw(1, '压气机', 0), sub: '一排排叶片' });

  // c2 — blades keep turning, squeezing stage by stage
  S.spin('compressor', { at: P.c(1, 0.4), speed: 320 });
  P.tag(180, 800, '一级级挤紧', { at: P.c(2, 0.3) });

  // c3 — the number counts up to 40 as it is spoken
  P.spec(180, 190, 40, { at: t40 - 1.2, dur: 1.2, unit: '倍', size: 130 });
  P.headline(180, 350, '约40倍', { at: t40, size: 52, eyebrow: '压比' });
});
