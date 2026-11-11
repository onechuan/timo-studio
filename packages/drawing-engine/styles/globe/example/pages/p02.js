ENGINE.visual('p02', (P) => {
  const BUDE = [50.83, -4.55];

  // The globe, opening over the eastern North Atlantic
  P.globe({ view: [47, -20], spin: 0.6, pitch: 0.5, zoom: 1.4 });
  P.title('A hose full of light', { kicker: 'CABLES' });

  // Beat 1: fly down and tilt toward the beach at Bude
  P.gfocus(BUDE, { at: 0.2, zoom: 2.2 });
  P.gdot(BUDE, { at: P.cw(0, 'Cornwall', -0.2), label: 'Bude, Cornwall' });

  // Beat 2: a cyan cable unrolls from Bude out into the Atlantic, to New York
  const routeAt = P.c(1, 0.1);
  P.groute([
    BUDE,
    [50.3, -8.0],
    [49.5, -15.0],
    [47.5, -28.0],
    [44.5, -42.0],
    [41.8, -56.0],
    [40.4, -68.0],
    [40.55, -73.4],
    'New York',
  ], { at: routeAt, dur: Math.max(4, P.cw(3, 'York') - routeAt), color: 'blue', w: 1.6 });
  P.glabel([49.2, -11.5], 'Garden-hose thick', { at: P.cw(1, 'hose', -0.2) });

  // c2: what is inside
  P.glabel([47.0, -24.0], 'Hair-thin {b:glass fibres}', { at: P.cw(2, 'fibres', -0.2) });

  // Beat 3: pull back as the light races to New York
  P.gfocus([45, -38], { at: P.c(3, -0.8), zoom: 1.5, dur: 1.6 });
  P.gdot('New York', { at: P.cw(3, 'York', -0.1), label: true });
  P.glabel([43.5, -50.0], 'Pulses of {b:light}', { at: P.cw(3, 'light', 0.2) });
});
