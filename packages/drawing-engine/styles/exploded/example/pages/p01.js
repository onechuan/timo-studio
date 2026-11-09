ENGINE.visual('p01', (P) => {
  P.title('几百吨的飞机靠什么往前走');

  const S = P.studio({ model: 'turbofan', at: 0, box: [660, 200, 1100, 650], labelSide: 'top' });
  S.ghost('nacelle', P.c(1, 0.6));

  // c0: one slow full turn on the turntable
  S.turntable(0.3, { dur: Math.max(4.5, P.c(1) - 0.5) });

  // c1: the answer — the jet engine; fan starts turning, slow push in
  S.spin('fan', { at: P.cw(1, '喷气发动机', -0.2), speed: 90 });
  S.dolly(P.c(1, 0.3), 1.15);
  S.label('fan', null, { at: P.cw(1, '喷气发动机', 0.3), sub: '吸进空气' });
  P.headline(170, 360, '喷气\n发动机', { at: P.cw(1, '喷气发动机', -0.1), size: 96, eyebrow: '答案挂在翅膀下面' });

  // c2: air in at the front, out faster at the back
  P.tag(175, 640, '前 · 吸进来', { at: P.cw(2, '吸进', -0.1) });
  S.flow('fan', 'nozzle', { at: P.cw(2, '吸进', 0), color: 'blue' });
  S.label('nozzle', null, { at: P.cw(2, '喷出去', -0.2), sub: '更快喷出' });
  P.tag(175, 710, '后 · 喷出去', { at: P.cw(2, '喷出去', -0.1), hot: true });
});
