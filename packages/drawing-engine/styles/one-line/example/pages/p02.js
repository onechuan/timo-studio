ENGINE.visual('p02', (P) => {
  P.title('Share every edge');

  const X = 760, Y = 540, S = 850;

  // Two facing profiles pressed together: one line, nose to nose (1000 box)
  const touching = [
    [330, 960], [345, 820], [365, 720], [400, 680], [385, 650], [410, 630],
    [392, 605], [440, 585], [497, 560, 1], [430, 520], [400, 470], [405, 380],
    [430, 290], [470, 230], [500, 215], [530, 230], [570, 290], [595, 380],
    [600, 470], [570, 520], [503, 560, 1], [560, 585], [608, 605], [590, 630],
    [615, 650], [600, 680], [635, 720], [655, 820], [670, 960],
  ];

  // warmth behind the two faces
  P.spot(X + 90, Y - 60, 230, { color: 'red', at: 0 });

  const h = P.held('faces', X, Y, S);

  // 1. they press forward until nose meets nose
  const tPress = Math.min(P.cw(0, 'evening'), P.c(1) - 0.2);
  const m1 = P.morph(['faces', X, Y, S], [touching, X, Y, S], {
    mode: 'melt', replaces: h, at: P.c(0, 0.3), done: tPress,
  });

  // 2. they melt into each other and curl into one tangle
  const tOverlap = P.cw(1, 'overlap');
  const m2 = P.morph([touching, X, Y, S], ['tangle', X, Y, S], {
    mode: 'melt', replaces: m1, at: Math.max(tPress + 0.2, P.cw(1, 'touch')), done: tOverlap,
  });

  // 3. the pen circles once more, tightening the tangle
  const tWhom = Math.min(P.cw(2, 'whom'), P.endT - 0.8);
  P.morph(['tangle', X, Y, S], ['tangle', X, Y, S * 0.84], {
    mode: 'melt', replaces: m2, at: Math.max(tOverlap + 0.3, P.cw(2, 'tell')), done: tWhom,
  });

  P.caption('Whose line\nis whose?', 1240, 470, {
    size: 52, at: P.cw(2, 'line'),
  });

  P.cam([P.push(P.cw(2, 'Soon'), 900, 540, 1.12)]);
});
