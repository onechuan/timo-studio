ENGINE.visual('p05', (P) => {
  const tAnquan = P.cw(0, '安全'), tDizhi = P.cw(1, '地址'), tHuiqu = P.cw(2, '回去');
  P.set('green', { motif: 'outdoor' });
  P.stepcard(4, '再打119', { of: 4, at: 0.2, tint: 'yellow', burst: 'blue' });
  // the house we escaped from, with its smoke
  P.thing('house', 1560, 640, { size: 340, color: 'red', at: 1.9 });
  P.thing('smoke', 1600, 360, { size: 300, at: 2.1 });
  // the presenter, the same look on every page
  P.presenter(420, 845, { size: 500, face: 'r', hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    pose: [[0, 'idle'], [0.2, 'point'], [tAnquan, 'hold'], [P.c(1, 0.2), 'press'], [P.c(2, 0.1), 'stop']],
    holds: [[0, 'phone'], [P.c(2, 0.1), false]], holdsColor: 'blue', press: tDizhi, talk: [[0, false], [P.c(0), true], [P.endT, false]] });
  P.tag(640, 250, '楼外安全处', { size: 40, at: tAnquan, out: P.c(1) });
  // the close-up: a finger dials 119 inside the call-out
  P.cam([P.push(P.c(1, 0.1), 1100, 520, 1.06), P.back(P.c(2))]);
  const C = P.callout(1120, 500, 220, { to: [560, 520], at: P.c(1), out: P.c(2) - 0.1, label: '说清地址' });
  C.thing('phone', 1090, 470, { size: 300, color: 'blue', at: P.c(1), screen: [[0, 'blank'], [tDizhi, 'call']], text: '119' });
  C.glove(1230, 640, { kind: 'point', size: 240, rot: -135, sleeve: 'orange', press: tDizhi, at: P.c(1, 0.1) });
  // don't go back in
  P.swoosh(760, 560, 1360, 560, { bend: -0.2, at: P.c(2, 0.2), out: P.endT + 0.5 });
  P.verdict('cross', 1060, 470, { size: 170, at: tHuiqu });
  P.tag(1280, 270, '别再回去', { size: 42, at: tHuiqu + 0.2 });
});
