ENGINE.visual('p02', (P) => {
  const tSmoke = P.c(1, 0.1);
  const tUp = P.cw(1, '往上飘');
  const tBend = P.cw(2, '弯下腰');
  const tWalkEnd = P.c(3, 0.6);
  const tLow = P.c(3, 0.2);
  const tTowel = P.cw(4, '毛巾');

  P.set('blue', { motif: 'room' });
  P.stepcard(1, '弯腰低姿走', { of: 4, at: 0.2, tint: 'yellow', burst: 'orange' });

  // smoke: rises from the floor and gathers under the ceiling
  const rise = (a, y0, y1) => (lt) => y0 - (y0 - y1) * PV.K(lt, a, 1.8, 'out');
  P.thing('smoke', 1280, rise(tSmoke, 760, 330), { size: 440, at: tSmoke, bob: true });
  P.thing('smoke', 1620, rise(tSmoke + 0.4, 780, 300), { size: 360, at: tSmoke + 0.4, bob: true });
  P.swoosh(1020, 720, 1060, 330, { bend: 0.2, at: tUp - 0.3 });
  P.tag(1460, 560, '烟往上走', { align: 'c', size: 40, at: tUp, out: P.c(4) });

  // presenter bends low and steps right
  const px = (lt) => 380 + 220 * PV.K(lt, tBend + 0.2, Math.max(0.6, tWalkEnd - tBend - 0.2));
  P.presenter(px, 845, {
    size: 500, face: 'r',
    hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    pose: [[0, 'idle'], [0.2, 'point'], [P.c(1), 'present'], [tBend, 'crouch']],
    talk: [[0, false], [P.c(0), true], [P.endT, false]],
  });

  // low air is cleaner
  P.swoosh(780, 810, 1080, 810, { bend: -0.15, dashed: true, at: tLow - 0.2 });
  P.tag(1040, 720, '低处空气多', { align: 'c', size: 40, tint: 'green', at: tLow });

  // close-up: wet towel pressed over nose and mouth
  const C = P.callout(1360, 560, 200, { to: [700, 600], at: tTowel - 0.3 });
  C.thing('towel', 1360, 560, { size: 250, color: 'yellow', at: tTowel - 0.2 });
  C.glove(1400, 600, { kind: 'flat', size: 250, rot: -150, press: tTowel + 0.3, sleeve: 'orange', at: tTowel - 0.1 });
  P.tag(1360, 815, '湿毛巾捂口鼻', { align: 'c', size: 40, at: tTowel + 0.5 });

  P.cam([P.push(tTowel, 1100, 580, 1.08)]);
});
