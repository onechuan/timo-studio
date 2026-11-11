ENGINE.visual('p02', (P) => {
  // One scene: Earth on the left, the Moon on the right, side-on mid shot
  const S = P.space({ target: [5, 0, 0], dist: 24, az: 0, el: 8, drift: 1.2, nebula: 'teal', light: [-30, 6, 20] });
  P.title('月球：1.3秒');
  const earth = S.body('earth', { pos: [0, 0, 0], at: 0 });
  const moon = S.body('moon', { around: earth, dist: 10, period: 90, phase: 0, at: 0.2 });
  S.orbit(earth, 10, { at: 0.3, color: 'blue' });
  S.label(earth, '地球', { at: 0.6, sub: '直径 12,742 公里', side: 'l', out: P.c(2, 0.2) });
  // c0: the measuring line and its distance
  S.measure(earth, moon, '38.44万公里', { at: P.c(0, 0.9), sub: '384,400 km' });

  // c1: a light pulse leaves Earth and runs to the Moon in 1.3 s (real time)
  const tGo = P.c(1, 0.5);
  S.path([earth, moon], { at: tGo, dur: 1.3, color: 'yellow', label: '光' });
  // camera pans along with the pulse
  S.cameraTo([7, 0, 0], 18, tGo, 1.6, { el: 6 });
  P.readout(1180, 640, 1.3, {
    caption: '光到月球', unit: '秒', fmt: (v) => v.toFixed(1),
    at: P.c(1, 1.2), dur: 1.0, color: 'orange', out: P.c(2, 1.4),
  });

  // the pulse arrives: the Moon lights up
  S.burst(moon, tGo + 1.3, { r: 1.2, dur: 0.8 });

  // c2: push in to the Moon's surface
  S.cameraTo(moon, 2.6, P.c(2, 0.1), 2.4, { shift: [-0.15, 0], el: 10 });
  S.label(moon, '月球', { at: P.c(3, 0.6), sub: '1.3秒前的样子', color: 'orange' });
});
