ENGINE.visual('p05', (P) => {
  P.title('管住需求，比加宽路更有用', { accent: 'green' });

  const D = P.diorama({ seed: 7, glide: 1 });

  // the same little town
  D.terrain({ hills: 0.6, river: true, riverAt: 24, trees: 0.5 });
  const city = D.city({ area: [9, 3, 13, 10], kind: 'mixed', density: 0.8, height: 1 });
  D.city({ area: [25, 4, 6, 9], kind: 'houses', density: 0.7 });
  D.city({ area: [1, 11, 6, 5], kind: 'houses', density: 0.6 });
  D.zone([1, 3, 6, 6], 'farm');
  D.zone([14, 14, 6, 3], 'park');
  D.zone([24, 14, 7, 3], 'forest');

  // the widened highway into town from the west
  D.road([[0, 9], [5, 9], [9, 8.5], [16, 8]], { kind: 'highway' });
  // a rail line from the eastern suburbs into the centre
  const station = D.landmark('station', [15, 6], { at: P.c(1, 0.2) });
  D.road([[32, 5], [26, 5.5], [20, 6], [15, 6]], { kind: 'rail', at: P.c(1), dur: 1.2 });
  D.landmark('bridge', [24, 5.6], { at: P.c(1, 0.6) });

  // traffic: jammed at first, flowing again once trains run
  D.traffic({
    density: [[0, 0.9], [P.c(2, 0.3), 0.4, 2.5]],
    speed: [[0, 0.25], [P.c(2, 0.3), 1.1, 2.5]],
  });

  // beat 1: a congestion charge at the entrance
  const gate = [6, 9];
  D.flyTo(gate, P.c(0, 0.2), 2.2, { zoom: 2.5, tilt: 0.55 });
  D.highlight([4, 8, 3, 2], { color: 'orange', at: P.cw(0, '付出'), out: P.c(1, 0.3) });
  D.label(gate, '拥堵收费', { at: P.cw(0, '成本'), out: P.c(2, 0.2), sub: '进城付费', color: 'orange' });

  // beat 2: the train runs full into the centre — camera follows it
  D.flyTo([24, 5.5], P.c(1, 0.1), 1.6, { zoom: 2.2, tilt: 0.55 });
  D.flyTo([16, 6], P.cw(1, '火车', -0.6), 2.0, { zoom: 2.2, tilt: 0.55 });
  D.label(station, '公共交通', { at: P.cw(1, '火车'), sub: '又快又准', color: 'orange' });

  // beat 3: back to the whole model, the highway flows again
  D.back(P.c(2, 0.1), 2.5);
  D.highlight([0, 7.5, 16, 2.5], { color: 'orange', at: P.cw(2, '松'), out: P.c(3, 0.6) });
  D.label([3, 9], '车流松开', { at: P.cw(2, '松'), sub: '重新流动', color: 'green' });

  // closing answer
  D.label([12, 11.5], '看需求', { at: P.cw(3, '多少'), sub: '有多少人要走', color: 'orange' });
});
