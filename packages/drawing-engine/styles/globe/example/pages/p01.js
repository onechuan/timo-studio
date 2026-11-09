ENGINE.visual('p01', (P) => {
  // The Earth over the North Atlantic, turning slowly
  P.globe({ view: [48, -25], spin: 1.5 });
  P.title('How does the internet cross the ocean?', { kicker: 'CABLES' });

  // Drift closer onto the North Atlantic as London is named
  P.gfocus('North Atlantic', { at: 0.1, zoom: 1.35 });
  P.gdot('London', { label: true, at: P.cw(0, 'London', -0.2) });

  // New York and the glowing arc from London
  P.gdot('New York', { label: true, at: P.cw(1, 'New', -0.2) });
  P.garc('London', 'New York', { at: P.cw(1, 'New', 0), dur: 1.6, color: 'orange', w: 2 });

  // "Cross the Atlantic" — the camera settles over the ocean between them
  P.gfocus([46, -38], { at: P.cw(2, 'Atlantic', -0.3), zoom: 1.6 });
  P.glabel([62, -30], 'Satellites?', { at: P.cw(2, 'satellites', -0.1) });

  // 99% lands on the mid-Atlantic
  const dur = 1.2;
  P.gnum([42, -38], 99, {
    at: P.cw(3, '99%', -dur), dur, unit: '%', suffix: '%',
    caption: 'by sea', color: 'orange', size: 76,
  });

  P.gsource('Source: TeleGeography, 2024', { at: P.c(3, 0.6) });
});
