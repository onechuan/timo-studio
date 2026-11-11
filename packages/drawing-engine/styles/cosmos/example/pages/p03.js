ENGINE.visual('p03', (P) => {
  // One live scene: the Sun burning on the left, Earth far off on its orbit.
  const S = P.space({ target: [22, 0, 0], dist: 78, az: 8, el: 16, drift: 1.2, nebula: 'amber' });

  P.title('太阳：8分20秒前的阳光');

  const sun = S.body('sun', { pos: [0, 0, 0], at: 0 });
  const earth = S.body('earth', { around: sun, dist: 42, period: 400, phase: 0, at: 0.2 });
  S.orbit(sun, 42, { at: 0.3, color: 'blue' });

  S.label(sun, '太阳', { at: 0.5, side: 'r' });
  S.label(earth, '地球', { at: 1.0, side: 'r' });

  // Beat 1: the distance, landing on its spoken number
  S.measure(sun, earth, '1.5亿公里', { at: P.cw(0, '1.5亿公里', -0.3), sub: '1 AU' });

  // Beat 2: a light pulse leaves the Sun and crawls along the line to Earth
  const tPulse = P.c(1, 0.1);
  const tArrive = P.c(2, 1.0);
  S.path([sun, earth], { at: tPulse, dur: tArrive - tPulse, color: 'yellow', label: '阳光' });
  S.cameraTo([24, 0, 0], 62, P.c(1, 0.2), 2.0, { az: 30, el: 12 });

  // The travel time counts up and lands on "8分20秒"
  const land = P.cw(1, '8分20秒', 0.2);
  P.readout(1240, 770, 500, {
    caption: '光从太阳到地球',
    from: 0,
    dur: 1.4,
    at: land - 1.4,
    size: 110,
    color: 'orange',
    fmt: (v) => `${Math.floor(v / 60)}分${String(Math.round(v % 60)).padStart(2, '0')}秒`,
  });

  // Beat 3: push in on Earth as the pulse arrives and lights its day side
  S.cameraTo(earth, 5, P.c(2, 0.2), 2.4, { az: -35, el: 10, shift: [-0.15, 0] });
  S.label(earth, '8分多钟后才知道', { at: P.c(3, 0.2), side: 'r', color: 'orange' });
});
