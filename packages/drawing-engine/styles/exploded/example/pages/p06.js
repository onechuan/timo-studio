ENGINE.visual('p06', (P) => {
  P.title('往后喷，往前推');

  const S = P.studio({ model: 'turbofan', at: 0, box: [640, 200, 1120, 660], labelSide: 'top' });

  // starts apart (continuing from the previous pages), fan always turning
  S.explode(0, { dur: 0.01 })
    .spin('fan', { at: 0, speed: 160 })
    .turn(0.3, 18)
    // beat 1: nozzle glows, gas streams out fast
    .label('nozzle', '尾喷口', { at: P.c(0, 0.1), sub: '高速喷出', side: 'top' })
    .highlight('nozzle', P.c(0, 0.2), { until: P.c(1, 0.1) })
    .flow('turbine', 'nozzle', { at: P.c(0, 0.4), color: 'blue' })
    // beat 2: click back together, slow push in
    .assemble(P.c(1, 0.3))
    .camera([
      { at: P.c(1, 0.2), zoom: 1.12 },
      { at: P.c(2, 0.1), zoom: 0.96 },
    ])
    // beat 3: the whole engine rests turning on the turntable
    .turntable(P.c(2, 0.2), { dur: Math.max(4, P.endT - P.c(2) + 1.5) });

  P.headline(170, 420, '推力', { at: P.cw(1, '推力', -0.2), size: 120, eyebrow: '往后推空气 · 空气往前推' });
  P.headline(175, 650, '一口空气走完五站\n飞机前进一点', { at: P.c(2, 0.3), size: 46, color: 'soft' });
});
