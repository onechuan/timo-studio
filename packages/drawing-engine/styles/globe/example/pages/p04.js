ENGINE.visual('p04', (P) => {
  P.globe({ view: 'Europe', spin: 1.5, pitch: 0.5 });
  P.title('Where the cables come ashore', { kicker: 'LANDING POINTS' });

  // Opening: close on Western Europe's coasts
  P.gfocus('France', { at: 0.1, zoom: 1.6 });

  // Beat 1: Cornwall, Marseille
  const tCorn = P.cw(1, 'Cornwall');
  const tMars = P.cw(1, 'Marseille');
  P.gdot('Cornwall', { at: tCorn - 0.2, label: 'Cornwall', color: 'orange' });
  P.gdot('Marseille', { at: tMars - 0.2, label: 'Marseille', color: 'orange' });

  // Beat 2: fly east, Mumbai and Singapore light up
  const tMum = P.cw(1, 'Mumbai');
  const tSin = P.cw(1, 'Singapore');
  P.gfocus('Singapore', { at: Math.min(tMum - 0.6, P.c(1, 1.6)), zoom: 1.3 });
  P.gdot('Mumbai', { at: tMum + 0.6, label: 'Mumbai', color: 'orange' });
  P.gdot('Singapore', { at: tSin + 0.3, label: 'Singapore', color: 'orange', size: 1.4 });

  // Beat 3: Singapore fans out across Asia
  const tAsia = Math.max(P.cw(2, 'Asia'), P.c(2, 1.2));
  P.gfan('Singapore', [
    { to: 'Hong Kong', at: tAsia - 1.6, label: 'Hong Kong' },
    { to: 'Tokyo', at: tAsia - 1.1, label: 'Tokyo' },
    { to: 'Sydney', at: tAsia - 0.6, label: 'Sydney' },
    { to: 'Mumbai', at: tAsia - 0.1 },
  ], { color: 'orange', w: 1.6, frame: false });
});
