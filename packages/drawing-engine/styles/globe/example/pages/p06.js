ENGINE.visual('p06', (P) => {
  // Open close-in on the North Atlantic, then pull back to the whole Earth.
  P.globe({ view: [32, -30], spin: 3 });
  P.gfocus([22, -25], { at: P.cw(0, 'abroad') - 0.3, zoom: 0.92 });

  P.title('Light under the sea', { kicker: 'CLOSE' });

  // Every cable of the film lights at once.
  const t0 = 0.2;
  P.groute(['New York', 'North Atlantic', [50.07, -5.71]], { at: t0, dur: 2.2, color: 'blue', w: 1.6 });
  P.groute([[36.85, -75.98], 'North Atlantic', [43.36, -3.0]], { at: t0 + 0.2, dur: 2.2, color: 'blue', w: 1.2 });
  P.groute([[-3.72, -38.54], [15.0, -30.0], [38.69, -9.42]], { at: t0 + 0.4, dur: 2.2, color: 'blue', w: 1.2 });
  P.groute(['Marseille', 'Mediterranean Sea', 'Suez Canal', 'Red Sea', 'Gulf of Aden', 'Laccadive Sea', 'Singapore'],
    { at: t0 + 0.6, dur: 2.6, color: 'blue', w: 1.6 });
  P.groute([[6.45, 3.39], [10.0, -15.0], [38.69, -9.42]], { at: t0 + 0.8, dur: 2.2, color: 'blue', w: 1.0 });
  P.groute([[34.05, -118.24], [30.0, -150.0], [35.0, 160.0], [35.0, 139.9]], { at: t0 + 1.0, dur: 2.6, color: 'blue', w: 1.2 });

  // Landing places, named in white
  P.gdot('New York', { at: 0.2, label: true });
  P.gdot('Marseille', { at: 0.9, label: true });
  P.gdot('Fortaleza', { at: 1.4, label: true });

  // The final number lands on the ocean
  P.gnum([22, -45], 99, {
    at: P.cw(1, '99%') - 1.2, dur: 1.2, unit: '%', color: 'orange', caption: 'of data',
  });

  // The voice as light
  P.garc('New York', [50.07, -5.71], { at: P.cw(2, 'light') - 0.4, color: 'orange', w: 2.2, height: 0.08 });

  P.gsource('Source: TeleGeography, 2024');
});
