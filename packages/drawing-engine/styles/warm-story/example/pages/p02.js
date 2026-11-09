/* p02 Saving without investing: coins drop into the jar one by one, the level rises steadily, the label counts to 360,000. */
ENGINE.visual('p02', (P) => {
  P.title('一枚一枚地变多', { accent: 'orange' });
  P.ground(800, { at: 0 });
  const t1 = P.c(1), land = P.cw(1, '三十六万', 0.35);
  P.calendar(440, 520, 280, { at: 0, label: (lt) => `${Math.max(1, Math.round(PV.lerp(1, 30, PV.clamp(lt / (P.endT - 0.3)))))}年` });
  P.jar(1230, 810, 340, 470, { at: 0, level: (lt) => PV.clamp(lt / (P.endT - 0.3)) * 0.82 });
  for (let i = 0; i < Math.floor((P.endT - 0.5) / 0.5); i++) P.coin(1230, 380, 28, { at: 0.2 + i * 0.5, fall: { from: 200, at: 0.2 + i * 0.5, dur: 0.38, vanish: true } });
  P.tag(1230, 640, '', { at: t1, size: 56, count: { from: 0, to: 360000, at: t1, dur: land - t1 }, bg: 'paper' });
  P.tag(440, 760, '只存不投', { at: 0.3, size: 38, bg: 'mutedF', color: 'soft' });
  P.cam([P.push(t1, 1100, 560, 1.12), P.back(P.c(2) + 0.4)]);
});
