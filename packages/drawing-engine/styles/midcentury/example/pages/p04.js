ENGINE.visual('p04', (P) => {
  const K = PV.K;
  const tCard = 0.2, tDock = tCard + 1.6;
  const tShut = Math.max(P.cw(0, '关上'), tDock + 0.4);
  const tSmoke = P.c(1);
  const tBlock = Math.max(P.cw(1, '挡在'), tSmoke + 0.5);
  const tClock = P.c(2);
  const tTime = Math.max(P.cw(2, '时间'), tClock + 0.5);

  P.set('blue', { motif: 'room' });
  P.stepcard(3, '随手关门', { of: 4, at: tCard, dock: tDock, tint: 'yellow', burst: 'orange' });

  // smoke inside the room (behind the door), rolls in and stops against it
  P.thing('smoke', (lt) => {
    const u = K(lt, tSmoke, Math.max(0.4, tBlock - tSmoke), 'out');
    const bump = lt > tBlock ? Math.sin(Math.min(1, (lt - tBlock) / 0.35) * Math.PI) * 18 : 0;
    return 1660 - u * 380 + bump;
  }, 560, { size: 380, color: 'muted', at: tSmoke, out: tClock - 0.1 });

  // the door
  P.thing('door', 1020, 600, {
    size: 380, color: 'orange', at: tDock + 0.05,
    open: (lt) => 1 - K(lt, tShut - 0.15, 0.35, 'out'),
    hot: (lt) => lt > tBlock,
  });

  // presenter (same look on every page)
  P.presenter(420, 850, {
    size: 500, face: 'r', hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    pose: [[0, 'idle'], [tCard, 'point'], [tDock + 0.1, 'present'], [tShut - 0.45, 'press'],
      [tSmoke + 0.2, 'stop'], [tClock, 'present'], [tTime + 0.4, 'thumbsup']],
    press: tShut - 0.15,
    talk: [[0, false], [P.c(0), true], [P.endT, false]],
  });

  // "关上!" lands with the push
  P.headline('关上！', 760, 280, { size: 100, plate: 'yellow', at: tShut, out: tSmoke });
  P.swoosh(640, 520, 880, 560, { bend: -0.3, at: tShut - 0.3, out: tSmoke });

  // the fact: smoke and fire kept in
  P.tag(1180, 300, '挡住烟火', { size: 40, at: tBlock + 0.1, out: tClock - 0.1 });

  // the alarm clock: time stretches
  P.thing('clock', 1430, 470, {
    size: 300, color: 'red', at: tClock,
    time: (lt) => 3 + 2.5 * K(lt, tClock + 0.3, Math.max(0.6, tTime - tClock), 'inOut'),
  });
  P.swoosh(1240, 330, 1600, 320, { bend: -0.45, at: tClock + 0.4 });
  P.tag(1430, 700, '多争取时间', { size: 40, align: 'c', at: tTime });
  P.ornament('sparkle', 1660, 640, { size: 90, color: 'yellow', at: tTime + 0.2 });

  P.cam([P.push(tTime, 960, 540, 1.06)]);
});
