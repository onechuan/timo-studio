ENGINE.visual('p01', (P) => {
  P.title('月亮为什么会变形状？');
  // night falls: the sky scribbled in from left to right
  P.sky({ mode: 'night', at: 0, dur: 2.0, y: 430, from: 'left', stars: 14 });
  P.ground({ at: 0.4, y: 780, hill: 30 });

  // 朵朵 — yellow dress, pigtails, pink bow (same look every page)
  const tRound = P.cw(2, '圆圆');
  P.kid(460, 862, {
    at: 0.2, size: 420, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.cw(1, '弯弯', -0.3), 'point'], [tRound - 0.2, 'cheer'], [P.cw(3, '为什么', -0.2), 'think']],
    mood: [[0, 'happy'], [P.cw(1, '弯弯', -0.3), 'calm'], [tRound - 0.2, 'surprised'], [P.cw(3, '为什么', -0.2), 'worried']],
  });

  // the moon: a thin crescent first, then it fills up to a full moon on 圆圆
  const phase = (lt) => {
    const a = tRound - 0.6;
    if (lt < a) return 0.12;
    const u = Math.min(1, (lt - a) / 1.6);
    const e = u * u * (3 - 2 * u);
    return 0.12 + (0.5 - 0.12) * e;
  };
  P.moon(1360, 250, 140, {
    at: P.cw(1, '弯弯', -0.6), phase, face: true,
    mood: [[0, 'sleepy'], [tRound, 'happy']],
  });

  const boat = P.note(900, 560, '像一条小船', { at: P.cw(1, '弯弯', 0.3), size: 46, color: 'blue' });
  boat.hide(tRound - 0.4, 0.4);
  P.lines([[1080, 540], [1180, 470], [1250, 400]], { at: P.cw(1, '弯弯', 0.6), smooth: true, arrow: true, color: 'blue', w: 6, out: tRound - 0.4 });

  // the question lands on 为什么
  P.words('为什么？', 1250, 560, { at: P.cw(3, '为什么'), size: 140, align: 'c', colors: ['red', 'orange', 'green', 'blue'] });

  P.cam([P.push(P.c(3, 0.1), 760, 560, 1.08), P.back(P.endT + 0.3)]);
});
