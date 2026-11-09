ENGINE.visual('p01', (P) => {
  const tPhone = Math.min(P.cw(1, '手机', 0.1), P.c(1, 1.0));   // phone pops out of the hand
  const tCross = tPhone + 0.5;            // red cross stamps it
  const tLeave = P.cw(2, '离开');
  const tFour = P.cw(3, '4');

  P.set('blue', { motif: 'room' });
  P.title('着火了！', { kick: '开场', accent: 'red' });

  // exit door on the left (safe way out)
  P.thing('door', 250, 640, { size: 300, color: 'green', open: [[0, 0], [tLeave, 0], [tLeave + 0.5, 0.5]], at: 0 });
  P.tag(140, 830, '出口', { size: 32, tint: 'green', at: tLeave + 0.3 });

  // smoking door on the right
  P.thing('door', 1560, 640, { size: 300, color: 'red', hot: true, open: [[0, 0], [P.c(2), 0], [P.c(2, 0.4), 0.12]], at: 0 });
  P.thing('smoke', 1460, 480, { size: 260, at: 0.2, out: P.c(2), bob: true });
  P.thing('smoke', 1360, 420, { size: 420, at: P.c(2, 0.2), bob: true });

  // presenter
  P.presenter(640, 850, {
    size: 500, hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    face: [[0, 'r'], [P.c(2), 'l'], [P.c(3), 'r']],
    pose: [[0, 'worried'], [P.c(1), 'hold'], [tPhone, 'shrug'], [P.c(2, 0.2), 'point'], [P.c(3), 'present']],
    holds: [[0, null], [P.c(1), 'phone'], [tPhone, null]],
    holdsColor: 'purple',
    talk: [[0, true], [P.endT, false]],
    look: [[0, 1], [P.c(2), -1], [P.c(3), 1]],
  });

  // c1: the phone pops up and gets crossed out
  P.thing('phone', 960, 380, { size: 220, color: 'purple', screen: 'call', at: tPhone, out: P.c(2) });
  P.verdict('cross', 1040, 450, { size: 150, at: tCross, out: P.c(2) });
  P.tag(860, 600, '先别打电话', { size: 38, tint: 'red', at: tCross + 0.3, out: P.c(2) });

  // c2: point to the exit
  P.swoosh(540, 420, 330, 560, { bend: -0.3, at: P.c(2, 0.4) });
  P.headline('先{离开}', 330, 280, { size: 110, plate: 'yellow', at: tLeave });

  // c3: four actions
  P.bignum(980, 330, { to: 4, from: 0, dur: 0.6, unit: '个动作', size: 170, plate: 'yellow', at: tFour - 0.6 });
  P.ornament('sparkle', 1180, 230, { size: 90, color: 'yellow', at: tFour + 0.2 });

  P.cam([P.push(P.c(2, 0.3), 700, 540, 1.06), P.back(P.c(3))]);
});
