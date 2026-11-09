ENGINE.visual('p01', (P) => {
  P.title('新高速通车', { accent: 'orange' });

  const D = P.diorama({ seed: 7, sky: 'day', tilt: 0.6 });

  // the one place of the film
  D.terrain({ hills: 0.5, river: true, riverAt: 0.3, trees: 0.4 });
  const city = D.city({ area: [3, 4, 13, 11], density: 0.85, height: 1, kind: 'mixed' });
  const sub = D.city({ area: [24, 4, 7, 8], density: 0.6, kind: 'houses' });
  D.zone([17, 13, 6, 4], 'farm');
  D.zone([18, 3, 5, 4], 'forest');
  D.zone([4, 15, 6, 2], 'park');

  // the new highway: built from the city edge out to the suburbs
  const hw = [[9, 10], [16, 10], [21, 9], [27, 8]];
  D.road(hw, { kind: 'highway', at: 0.3, dur: Math.max(1.6, P.c(1) - 0.6) });

  // traffic: sparse and fast on opening day, then thickens and stops after three years
  const jam = P.cw(2, '三年后');
  D.traffic({
    density: [[0, 0.15], [jam, 0.95, 2.4]],
    speed: [[0, 1.5], [jam + 0.4, 0.08, 2.4]],
  });

  D.label([16, 10], '新高速', { at: P.cw(0, '高速'), sub: '通车', color: 'orange', out: jam });

  // camera: wide glide, then push onto the highway, hold during the jam, back wide for the question
  D.flyTo([18, 9.5], P.c(1, 0.1), 2.4, { zoom: 2.2, tilt: 0.55 });
  D.highlight([10, 8.5, 18, 3], { color: 'red', at: jam + 1.2 });
  D.label([20, 9], '堵满了', { at: P.cw(2, '堵满', -0.1), color: 'red', sub: '三年后' });

  P.placard(1520, 200, '三年后', { at: jam, sub: '通车之后' });

  D.back(P.c(3, 0.1), 2.4);
  D.label(city, '小城', { at: P.c(3, 0.4), color: 'orange' });
});
