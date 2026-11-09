// radar.js — radar, msgs
ENGINE.visual('p18', (P) => {
  P.title('radar.js · radar / msgs');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const axes = [{ label: '速度', color: 'blue' }, { label: '价格', color: 'orange' }, { label: '质量', color: 'green' }, { label: '服务', color: 'purple' }, { label: '口碑', color: 'red' }];
  P.radar(480, 560, 230, axes, (lt) => [0.8, 0.4, 0.7, 0.5, 0.9].map((v) => v * PV.K(lt, t1, 1)), { at: t0 });
  P.msgs(940, 300, [{ role: 'user', w: 380 }, { role: 'ai', w: 560, color: 'purple' }, { role: 'user', w: 260 }, { role: 'ai', w: 480, color: 'purple' }], { at: t0, roll: (lt) => PV.K(lt, t2, 0.9), card: { x: 1100, y: 420, w: 560, h: 120, text: '一句话总结' } });
});
