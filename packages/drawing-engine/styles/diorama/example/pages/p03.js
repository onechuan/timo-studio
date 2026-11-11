ENGINE.visual('p03', (P) => {
  P.title('机制：搬得更远，走得更多', { accent: 'orange' });
  const D = P.diorama({ seed: 7, sky: 'day', glide: 0.6 });
  D.terrain({ hills: 0.5, river: true, riverAt: 2, trees: 0.5 });
  const city = D.city({ area: [3, 4, 11, 10], kind: 'mixed', density: 0.85, height: 1 });
  D.zone([1, 15, 8, 3], 'park');
  D.zone([27, 3, 4, 5], 'farm');
  D.zone([27, 12, 4, 4], 'forest');
  D.road([[2, 9], [14, 9], [31, 9]], { kind: 'highway' });
  const lots = [16, 4, 11, 11];
  D.highlight(lots, { color: 'orange', at: P.c(0, 0.6), out: P.c(2, 0.4) });
  D.label([21, 6], '待建地块', { at: P.c(0, 1.0), out: P.c(1, 0.6), sub: '空地', color: 'orange' });
  const h1 = D.city({ area: [16, 4, 5, 4], kind: 'houses', density: 0.8, at: P.cw(1, '住得更远') });
  D.city({ area: [16, 11, 5, 4], kind: 'houses', density: 0.8, at: P.c(2, 0.2) });
  D.city({ area: [21, 4, 6, 4], kind: 'houses', density: 0.75, at: P.c(2, 1.2) });
  const h4 = D.city({ area: [21, 11, 6, 4], kind: 'houses', density: 0.75, at: P.c(2, 2.2) });
  D.label(h1, '住得更远', { at: P.cw(1, '住得更远', 0.2), out: P.c(3), color: 'orange' });
  D.label(h4, '新住宅区', { at: P.c(2, 1.0), out: P.c(4), sub: '一片片', color: 'green' });
  P.placard(1480, 200, (lt) => String(2021 + Math.round(6 * PV.K(lt, P.c(2), 3))) + '年', { at: P.c(2), sub: '郊区扩张' });
  D.traffic({
    density: [[0, 0.35], [P.c(3), 0.95, 3]],
    speed: [[0, 1], [P.c(3, 1.5), 0.6, 2], [P.c(4), 0.15, 2]],
  });
  D.label([18, 9], '开车进城', { at: P.c(3, 0.4), sub: '每一户', color: 'orange' });
  D.label(city, '车流填满', { at: P.c(4, 0.4), color: 'red', sub: '路又堵了' });
  D.flyTo([21, 8], P.c(1), 2.5, { zoom: 2.2, tilt: 0.55 });
  D.back(P.c(3), 2.5);
});
