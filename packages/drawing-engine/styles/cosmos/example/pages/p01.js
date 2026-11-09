ENGINE.visual('p01', (P) => {
  // opening: Earth close, a beam of light circling it, then the camera backs away for the journey
  const S = P.space({ target: 'earth', dist: 4, shift: [-0.15, 0], az: 20, el: 12, drift: 3, nebula: 'teal' });
  P.title('光速有多快');

  const earth = S.body('earth', { at: 0 });

  // c0: the speed of light
  P.readout(1180, 640, 30, {
    caption: '光速', unit: '万公里/秒', size: 120, color: 'orange',
    at: P.c(0, 0.5), dur: 1.2, out: P.c(1, -0.1),
  });

  // c1: a beam circling the equator, lap after lap
  const R = 1.18, N = 8, laps = 4;
  const pts = [];
  for (let k = 0; k <= N * laps; k++) {
    const a = (k / N) * Math.PI * 2;
    pts.push([Math.cos(a) * R, 0, Math.sin(a) * R]);
  }
  S.path(pts, { at: P.c(1, 0.1), dur: Math.max(2.2, P.c(2) - P.c(1) + 0.4), color: 'yellow' });
  S.cameraTo('earth', 5.2, P.c(1), 1.6, { el: 22 });
  S.label(earth, '光束', { at: P.c(1, 0.6), sub: '1秒 · 7.5圈', color: 'blue', out: P.c(2, 0.6) });

  // c2: pull back, Earth shrinks into the dark
  S.cameraTo('earth', 26, P.c(2), 2.6, { el: 14 });
  S.label(earth, '地球', { at: P.c(2, 1.6), sub: '直径 12,742 km', color: 'blue' });

  // c3: keep pulling back as the journey begins
  S.cameraTo('earth', 60, P.c(3), 2.4, { el: 10 });
});
