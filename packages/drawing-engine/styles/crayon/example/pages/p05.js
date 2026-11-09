ENGINE.visual('p05', (P) => {
  P.title('月亮一个月变一圈');
  // the night setting
  P.sky({ mode: 'night', at: 0, y: 500, stars: 12 });
  P.ground({ at: 0.2, y: 790, hill: 26 });

  // 朵朵 — yellow dress, pigtails, pink bow (same look every page)
  P.kid(250, 860, { at: 0.15, size: 400, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.c(0, 0.3), 'point'], [P.c(1, 0.2), 'think'], [P.cw(2, '满月'), 'cheer'],
      [P.c(3, 0.3), 'point'], [P.cw(4, '一个月'), 'jump']],
    mood: [[0, 'happy'], [P.c(1, 0.2), 'calm'], [P.cw(2, '满月'), 'laugh'],
      [P.c(3, 0.3), 'surprised'], [P.cw(4, '一个月'), 'happy']] });

  // 1. the thin crescent
  P.moon(640, 300, 115, { at: P.c(0, 0), phase: 0.1, face: false });
  P.note(420, 560, '月牙', { at: P.cw(0, '月牙'), size: 58, to: [610, 430] });

  // 2. half moon
  P.moon(950, 300, 115, { at: P.c(1, 0.1), phase: 0.25, face: false });

  // 3. the full moon with a face
  P.moon(1275, 300, 150, { at: P.cw(2, '满月', -0.5), phase: 0.5, face: true, mood: 'laugh' });
  P.twinkle(1275, 300, { at: P.cw(2, '满月', 0.3), r: 210 });

  // 4. the moon on the right gets thinner again
  const wane = P.c(3, 0.6);
  const wDur = Math.max(1.2, P.c(4) - wane - 0.2);
  P.moon(1600, 300, 115, { at: P.c(3, 0), face: true, mood: [[0, 'calm'], [wane + wDur, 'sleepy']],
    phase: (lt) => 0.5 + 0.4 * PV.K(lt, wane, wDur) });

  // 5. curvy arrow from the last moon back to the first, and the key word
  P.lines([[1610, 450], [1460, 580], [1110, 615], [800, 580], [665, 445]],
    { at: P.cw(4, '一个月', -0.7), dur: 1.4, smooth: true, arrow: true, color: 'orange', w: 9 });
  P.words('一个月', 1100, 625, { at: P.cw(4, '一个月'), size: 120, align: 'c', colors: ['red', 'orange', 'blue'] });
});
