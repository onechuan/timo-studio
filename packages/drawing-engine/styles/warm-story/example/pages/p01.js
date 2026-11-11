/* p01 Opening: a hand drops a coin into a glass jar, the desk calendar flips from year 1 to year 30, a question mark pops up on the jar. */
ENGINE.visual('p01', (P) => {
  P.title('三十年后有多少？', { accent: 'orange' });
  P.ground(780, { at: 0 });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  // the jar and the hand are already there when the page turns in
  P.jar(1180, 790, 280, 360, { at: 0, level: (lt) => PV.clamp((lt - t0) / (P.endT - t0)) * 0.32 });
  P.hand(1060, 300, 170, { at: 0.1, rot: 18 });
  for (let i = 0; i < Math.floor((P.endT - t0) / 0.75); i++) P.coin(1170, 470, 30, { at: t0 + 0.25 + i * 0.75, fall: { from: 330, at: t0 + 0.25 + i * 0.75, dur: 0.42, vanish: true } });
  P.tag(1180, 860, '每月 1000', { at: t0 + 0.5, size: 40, bg: 'orangeF', color: 'ink' });
  // the calendar flips from year 1 to year 30 while the second sentence is spoken
  P.calendar(560, 500, 300, { at: t0 + 0.2, label: (lt) => `${Math.max(1, Math.round(PV.lerp(1, 30, PV.ease.inOut(PV.clamp((lt - t1) / 2.2)))))}年` });
  P.tag(1180, 600, '?', { at: t2 + 0.1, size: 120, bg: 'paper', color: 'red' });
  P.cam([P.push(t1, 700, 520, 1.12), P.back(t2)]);
});
