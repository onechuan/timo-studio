ENGINE.visual('p02', (P) => {
  P.title('直觉：路快了，开车就便宜了', { accent: 'orange' });

  const D = P.diorama({ seed: 7, sky: 'day', tilt: 0.62 });

  // The same small town: hills, a river, downtown, a suburb, a new highway
  D.terrain({ hills: 0.5, river: true, riverAt: 0.72, trees: 0.5 });
  const downtown = D.city({ area: [12, 4, 13, 9], kind: 'mixed', density: 0.85, height: 1 });
  const suburb = D.city({ area: [2, 6, 7, 8], kind: 'houses', density: 0.7 });
  D.zone([26, 4, 5, 6], 'farm');
  D.zone([3, 2, 7, 3], 'forest');
  D.zone([20, 13, 4, 3], 'park');

  // Rail line with its train into the centre, and the new highway beside it
  D.road([[0, 5], [8, 5], [14, 6]], { kind: 'rail' });
  D.road([[0, 12], [9, 11], [15, 9], [24, 8], [32, 8]], { kind: 'highway' });
  D.landmark('station', [14, 6], { s: 1 });

  // Traffic: a trickle first, then people switch, then new trips pile up
  D.traffic({
    density: [[0, 0.2], [P.c(1, 0.4), 0.5, 2], [P.c(2, 0.4), 0.85, 2.5]],
    speed: [[0, 1], [P.c(2, 1.5), 0.45, 2.5]],
  });

  // Beat 1: the train carries people to town
  D.label([7, 5], '坐火车', { at: P.c(0, 0.6), out: P.c(1, 0.3), sub: '进城', color: 'blue' });

  // Beat 2: push in on the suburb, cars head onto the highway
  D.flyTo(suburb, P.c(1, 0), 2.0, { zoom: 2.4 });
  D.label([6, 9], '改开车', { at: P.c(1, 0.5), out: P.c(2, 1.0), sub: '一辆接一辆', color: 'orange' });

  // Beat 3: pull back, the on-ramp traffic turns into a queue
  D.back(P.c(2, 0.6), 2.2);
  D.highlight([7, 9, 9, 4], { color: 'orange', at: P.c(2, 0.8) });
  D.label([10, 11], '新增出行', { at: P.cw(2, '出门', 0.2), sub: '原本不出门', color: 'orange' });

  // Cue 3: the time saved feels like a discount on driving
  P.placard(1460, 200, '打折', { at: P.c(3, 0.2), sub: '开车的时间成本' });
  D.label(downtown, '市中心', { at: P.c(3, 0.6), color: 'orange' });
});
