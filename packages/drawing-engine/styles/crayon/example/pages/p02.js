ENGINE.visual('p02', (P) => {
  P.title('月亮自己不发光');

  // the bedroom: a bed on bare paper
  P.thing('bed', 1560, 730, { at: 0, size: 420, color: 'blue' });

  // the ball by the bed — dull and dark in the dark room
  const BX = 1100, BY = 700, BR = 150;
  P.disc(BX, BY, BR, { at: 0.2, color: 'purpleF', cross: 'blue' });

  // 朵朵 (yellow dress, pigtails, pink bow) — same look on every page
  P.kid(380, 865, { at: 0.1, size: 420, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.c(0, 1.2), 'shrug'], [P.c(1), 'think'], [P.cw(2, '拿起'), 'hold'], [P.cw(3, '亮'), 'cheer']],
    mood: [[0, 'calm'], [P.c(0, 1.2), 'worried'], [P.c(1), 'sleepy'], [P.cw(2, '拿起'), 'happy'], [P.cw(3, '亮'), 'laugh']] });

  // the little moon with a face — sleepy, not glowing by itself
  P.moon(1560, 320, 105, { at: P.c(1, -0.2), phase: 0, face: true, mood: 'sleepy' });
  P.words('不会发光', 1050, 290, { at: P.cw(1, '不会发光'), size: 120, align: 'c', color: 'purple' });

  // the torch, raised by 朵朵, and a dashed beam toward the ball
  P.thing('torch', 560, 640, { at: P.cw(2, '手电筒', -0.4), size: 170, color: 'red' });
  P.lines([
    [[700, 620], [840, 600], [960, 590]],
    [[705, 640], [850, 660], [950, 700]],
    [[700, 660], [830, 720], [970, 800]],
  ], { at: P.cw(2, '照向'), dashed: true, color: 'orange', w: 8, stagger: 0.2, arrow: true });

  // the half facing the torch is coloured bright yellow
  const half = [];
  for (let k = 0; k <= 16; k++) {
    const a = Math.PI / 2 + (Math.PI * k) / 16;
    half.push([BX + BR * Math.cos(a), BY - BR * Math.sin(a)]);
  }
  P.crayon([{ p: half, color: 'yellow', line: 'orange', press: 1 }], { at: P.cw(3, '那一半', -0.2), sketch: 0.4, fill: P.cw(3, '亮', -0.1), dur: 0.8, knock: true });
  P.twinkle(BX - 80, BY - 40, { at: P.cw(3, '亮', 0.6), r: 200 });

  P.cam([P.push(P.c(3, 0.1), 900, 640, 1.08), P.back(P.endT + 0.2)]);
});
