ENGINE.visual('p05', (P) => {
  const S = P.space({ target: 'earth', dist: 4, nebula: 'violet' });
  P.title('银河系：10万年');

  const tMoon = P.cw(1, '1.3');
  const tSun = P.cw(2, '8');
  const tStar = P.cw(3, '4');
  const tGal = P.cw(4, '10');

  S.zoomOut(['earth', 'moon', 'solar', 'stars', 'galaxy'], {
    at: [0, tMoon, tSun, tStar, tGal],
  });

  // light-travel time for the current scale ring, lower left in the dark
  const steps = [
    [tMoon, '1.3秒'],
    [tSun, '8分钟'],
    [tStar, '4年多'],
    [tGal, '10万年'],
  ];
  P.follow((lt) => {
    let txt = '', t0 = -1;
    for (const [t, s] of steps) if (lt >= t - 0.2) { txt = s; t0 = t - 0.2; }
    const op = t0 < 0 ? 0 : Math.min(1, (lt - t0) / 0.4);
    return { text: txt, x: 1500, y: 300, opacity: op };
  }, { size: 96, color: 'orange' });

  P.follow((lt) => ({
    text: '光走过这段距离',
    x: 1500, y: 220,
    opacity: Math.min(1, Math.max(0, (lt - tMoon + 0.2) / 0.4)),
  }), { size: 32, color: 'blue' });

  // "you are here" marker in the galaxy view
  P.text('你在这里', { x: 1120, y: 560, size: 40, color: 'orange', at: P.c(5, 0.3), mode: 'fade' });
});
