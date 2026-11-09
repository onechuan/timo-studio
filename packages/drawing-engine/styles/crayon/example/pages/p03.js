ENGINE.visual('p03', (P) => {
  P.title('太阳照亮月亮的一半');
  P.ground({ at: 0, y: 800, hill: 28 });

  // 朵朵 (yellow dress, pigtails, pink bow) in the middle
  P.kid(960, 865, { at: 0.1, size: 400, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.c(1), 'wave'], [P.c(2), 'point'], [P.cw(3, '一半', 0.9), 'cheer']],
    mood: [[0, 'happy'], [P.c(1), 'laugh'], [P.c(2), 'surprised'], [P.cw(3, '一半'), 'happy']] });

  // the sun on the left, smiling: the big torch in the sky
  P.sun(340, 370, 140, { at: 0.2, face: true, mood: [[0, 'calm'], [P.cw(1, '太阳'), 'happy']] });
  P.note(380, 640, '大手电筒', { at: P.c(0, 1.0), size: 48, color: 'orange', to: [360, 545] });

  // the sun's light, dashed lines drawn towards the right
  P.lines([
    [[540, 260], [900, 250], [1310, 280]],
    [[560, 350], [920, 345], [1300, 360]],
    [[540, 440], [880, 450], [1310, 440]],
  ], { at: P.cw(1, '太阳', 0.1), dur: 0.9, stagger: 0.3, dashed: true, color: 'orange', w: 8, smooth: true, arrow: true });

  // the moon on the right, the half facing the sun coloured in
  P.moon(1500, 360, 170, { at: P.c(2, -0.2), phase: 0.75, face: true,
    mood: [[0, 'surprised'], [P.cw(3, '一半'), 'happy']] });

  // the key words
  P.words('一半亮', 1500, 600, { at: P.cw(3, '一半'), size: 130, align: 'c', colors: ['orange', 'red', 'purple'] });
  P.twinkle(1440, 360, { at: P.cw(3, '亮', 0.3), r: 200 });

  P.cam([P.push(P.c(2, 0.4), 1100, 450, 1.07), P.back(P.c(3, 1.6))]);
});
