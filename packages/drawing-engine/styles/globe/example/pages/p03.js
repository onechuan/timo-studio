ENGINE.visual('p03', (P) => {
  // Opens on the Indian Ocean, already close in, cables drawing.
  P.globe({ view: [12, 62], spin: 1.5, pitch: 0.5 });
  P.gfocus([12, 62], { at: 0, zoom: 1.5 });
  P.title('A web of 550 cables', { kicker: 'NETWORK' });

  const cab = { color: 'blue', w: 1.2 };

  // Indian Ocean (visible from the first frame)
  P.groute(['Singapore', 'Strait of Malacca', 'Laccadive Sea', 'Gulf of Aden', 'Red Sea', 'Suez Canal', 'Mediterranean Sea', [43.3, 5.37]],
    { ...cab, at: 0, dur: 2.2 });
  P.groute([[18.95, 72.82], [12, 58], [-4.04, 39.67]], { ...cab, at: 0, dur: 1.4 });
  P.groute([[-31.95, 115.86], [-12, 96], [1.3, 103.8]], { ...cab, at: 0.1, dur: 1.4 });
  P.gdot('Mumbai', { at: 0, label: true });

  // Pull back and turn to the Atlantic
  P.gfocus([28, -32], { at: P.c(0, 1.0), zoom: 1.15 });
  const a0 = P.c(0, 0.6);
  P.groute([[40.6, -73.9], [45, -40], [50, -15], [50.83, -4.55]], { ...cab, at: a0, dur: 3.2 });
  P.groute([[36.85, -75.98], [40, -40], [43.36, -8.4]], { ...cab, at: a0 + 0.4, dur: 3.2 });
  P.groute([[-3.72, -38.54], [12, -30], [38.7, -9.3]], { ...cab, at: a0 + 0.8, dur: 3.0 });
  P.groute([[-22.9, -43.2], [-15, -10], [-8.8, 13.23]], { ...cab, at: a0 + 1.2, dur: 3.0 });
  P.glabel([34, -38], '**About {b:550} cables**', { at: P.cw(0, '550', -0.2) });

  // Slow turn to the Pacific: the length lands on the open ocean
  P.gfocus([12, -165], { at: P.c(1, -0.3), zoom: 1.2 });
  const p0 = P.c(1, -0.2);
  P.groute([[33.9, -118.4], [21.3, -157.9], [13.4, 144.8], [35.0, 139.9]], { ...cab, at: p0, dur: 4.5 });
  P.groute([[45.6, -123.9], [48, -170], [35.6, 140.4]], { ...cab, at: p0 + 0.5, dur: 4.0 });
  P.groute([[-33.87, 151.21], [-15, -175], [21.3, -157.9], [37.8, -122.5]], { ...cab, at: p0 + 1.0, dur: 4.5 });
  P.groute([[33.9, -118.4], [10, -100], [-12.05, -77.1]], { ...cab, at: p0 + 1.5, dur: 3.5 });
  P.groute([[-36.85, 174.76], [-30, 165], [-33.87, 151.21]], { ...cab, at: p0 + 2.0, dur: 2.5 });

  const nd = 1.3;
  P.gnum([20, -175], 1.4, {
    at: P.cw(1, 'million') - nd, dur: nd, color: 'orange', decimals: 1, caption: 'million km of cable',
  });

  // Landing dots on each continent around the Pacific rim
  const d0 = P.cw(2, 'every', -0.1);
  [['Los Angeles', 0], [[-12.05, -77.1], 0.5, 'Lima'], ['Tokyo', 1.0], ['Sydney', 1.5], [[-36.85, 174.76], 2.0, 'Auckland']]
    .forEach(([pl, dt, name]) => P.gdot(pl, { at: d0 + dt, label: name || true }));

  P.gsource('Source: TeleGeography, 2024', { at: P.cw(1, 'million') });
});
