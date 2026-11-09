ENGINE.visual('p04', (P) => {
  P.title('月亮绕着地球转');

  // 朵朵 (yellow dress, pigtails, pink bow) watches from the left
  P.kid(330, 865, { at: 0, size: 420, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.c(1), 'point'], [P.c(2), 'think'], [P.cw(2, '不一样'), 'point'], [P.c(3, 0.2), 'cheer']],
    mood: [[0, 'happy'], [P.c(1), 'surprised'], [P.c(2), 'calm'], [P.cw(2, '不一样'), 'surprised'], [P.c(3, 0.2), 'laugh']] });

  // the earth with a face, in the middle
  const EX = 1150, EY = 520;
  P.thing('earth', EX, EY, { at: 0.3, size: 300, face: true,
    mood: [[0, 'happy'], [P.c(2), 'calm'], [P.c(3), 'laugh']] });
  P.note(560, 640, '地球', { at: P.cw(0, '地球', -0.3), size: 46, to: [990, 560] });

  // a little sun far right, lighting the moon from that side
  P.sun(1740, 190, 70, { at: P.c(0, 1.0), face: false });

  // the orbit: a curvy crayon arrow around the earth
  const RX = 410, RY = 280;
  const pt = (deg) => [EX + RX * Math.cos(deg * Math.PI / 180), EY - RY * Math.sin(deg * Math.PI / 180)];
  const ring = [];
  for (let d = -20; d <= 310; d += 15) ring.push(pt(d));
  P.lines(ring, { at: P.cw(1, '转圈圈', -0.4), dur: 1.4, smooth: true, arrow: true, dashed: true, color: 'purple', w: 8 });

  // the moon walks along the circle, redrawn at each stop; its lit side grows
  const stops = [
    { deg: -12, ph: 0.06, at: P.c(1, 1.0),            out: P.c(2) },
    { deg: 18,  ph: 0.12, at: P.c(2),                 out: P.cw(2, '地方', 0.1) },
    { deg: 70,  ph: 0.19, at: P.cw(2, '地方', 0.1),   out: P.cw(2, '不一样') },
    { deg: 112, ph: 0.25, at: P.cw(2, '不一样'),       out: null },
  ];
  stops.forEach((s, i) => {
    const [x, y] = pt(s.deg);
    const o = { at: s.at, phase: s.ph, face: true,
      mood: i === 3 ? [[0, 'happy'], [P.c(3), 'laugh']] : 'happy' };
    if (s.out != null) o.out = s.out;
    P.moon(x, y, 78, o);
  });

  // the key word lands on "不同"
  P.words('每晚不同', 1560, 730, { at: P.cw(3, '不同', -0.5), size: 110, align: 'c',
    colors: ['red', 'orange', 'green', 'blue'] });
  const [mx, my] = pt(112);
  P.twinkle(mx, my, { at: P.cw(3, '不同', 0.2), r: 130 });
});
