ENGINE.visual('p03', (P) => {
  const tHand = P.cw(1, '手背');
  const tNo = P.cw(2, '别开');
  const tOpen = P.cw(4, '打开');

  P.set('blue', { motif: 'room' });
  P.stepcard(2, '先摸门把', { of: 4, at: 0.2, tint: 'yellow' });

  // fire peeking out behind the door (hot case)
  P.thing('flame', 1140, 430, { size: 260, face: true, at: tNo + 0.15, out: P.c(4) });

  // the door, pushed open a crack at the end
  P.thing('door', 900, 560, {
    size: 440, color: 'orange', at: 2.0,
    open: (lt) => 0.3 * PV.K(lt, tOpen - 0.3, 1.2),
  });

  // presenter (same look as every page)
  P.presenter(400, 850, {
    size: 500, face: 'r',
    hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    pose: [
      [0, 'point'],
      [P.c(1), 'present'],
      [tNo, 'stop'],
      [P.c(3), 'point'],
      [P.c(4), 'press'],
    ],
    press: tOpen - 0.2,
    mood: [[0, 'happy'], [tNo, 'worried'], [P.c(4), 'focus']],
    talk: [[0, true], [P.endT, false]],
  });

  // close-up: back of the hand touching the door handle
  const C = P.callout(1490, 430, 240, {
    to: [995, 565], at: P.c(1, 0.1), label: '用手背',
  });
  C.shape('rect', 1490, 430, { w: 520, h: 520, fill: 'orange', line: 0, r: 0 });
  C.shape('rect', 1400, 450, { w: 90, h: 230, fill: 'yellow', r: 26 });
  C.shape('circle', 1400, 450, { w: 140, h: 140, fill: 'yellow', shade: 'orange' });
  C.glove(1580, 440, {
    kind: 'flat', size: 260, rot: 180, sleeve: 'orange',
    at: tHand - 0.2, press: tHand + 0.3,
  });

  // hot → don't open
  P.verdict('cross', 1170, 740, { size: 160, at: tNo, out: P.c(4) });
  P.tag(1250, 800, '烫：别开', { size: 40, tint: 'red', at: tNo + 0.3, out: P.c(4) });

  // take another way
  P.swoosh(740, 330, 230, 270, { bend: -0.3, at: P.c(3, 0.1), out: P.c(4) });

  // not hot → open slowly
  P.tag(1250, 800, '不烫：慢慢开', { size: 40, tint: 'green', at: P.c(4, 0.2) });

  P.cam([P.push(tHand, 1060, 520, 1.06), P.back(P.c(2, -0.3))]);
});
