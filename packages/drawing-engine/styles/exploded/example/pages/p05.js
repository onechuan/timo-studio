ENGINE.visual('p05', (P) => {
  P.title('涡轮带动风扇');

  const tTurb = P.cw(0, '涡轮', -0.2);
  const tShaft = P.cw(1, '同一根轴', -0.2);
  const tFan = P.cw(2, '风扇', -0.2);
  const tComp = P.cw(2, '压气机', -0.2);

  const S = P.studio({ model: 'turbofan', at: 0, box: [600, 190, 1160, 660], labelSide: 'right', yaw: -28, pitch: 12 });

  // cut the engine open so the spinning core is visible
  S.section(0.3, { cut: 'half' });

  // hot gas from the combustor rushes back over the turbine
  S.flow('combustor', 'turbine', { at: 0.5 });
  S.flow('turbine', 'nozzle', { at: 1.2 });

  // c0: the turbine is blown into a spin
  S.spin('turbine', { at: tTurb, speed: 220 });
  S.highlight('turbine', tTurb, { until: P.c(1, 0.6) });
  S.label('turbine', '涡轮', { at: tTurb + 0.2, sub: '被热气吹转' });

  // c1: one shaft runs front to back — slow pull back to see it whole
  S.camera([{ at: 0, zoom: 1.35 }, { at: P.c(1, 0.2), zoom: 1.12 }]);
  P.headline(170, 360, '同一根轴\n一起转', { at: tShaft, size: 80, eyebrow: '涡轮 → 风扇' });
  P.headline(170, 610, '一根转轴 · 前后贯通', { at: tShaft + 0.6, size: 34, color: 'soft' });

  // c2: fan and compressor turn with it
  S.spin('fan', { at: tFan, speed: 220 });
  S.label('fan', '风扇', { at: tFan + 0.1, sub: '同步旋转' });
  S.spin('compressor', { at: tComp, speed: 220 });
  S.label('compressor', '压气机', { at: tComp + 0.1, sub: '同步旋转' });

  // c3: the front keeps drawing in and squeezing air
  S.flow('fan', 'compressor', { at: P.c(3, 0), color: 'blue' });
  P.headline(170, 680, '持续吸气 · 压气', { at: P.c(3, 0.3), size: 34, color: 'soft' });
});
