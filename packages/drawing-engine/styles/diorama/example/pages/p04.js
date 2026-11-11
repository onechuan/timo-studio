ENGINE.visual('p04', (P) => {
  P.title('路多百分之一，车也多百分之一', { accent: 'red' });

  const D = P.diorama({ seed: 7, tilt: 0.6 });

  // the same little town
  D.terrain({ hills: 0.5, river: true, riverAt: 4, trees: 0.5 });
  const city = D.city({ area: [8, 3, 16, 9], kind: 'mixed', density: 0.8, height: 1, at: 0 });
  D.city({ area: [24, 4, 7, 7], kind: 'houses', density: 0.7, at: 0 });
  D.city({ area: [1, 6, 6, 6], kind: 'houses', density: 0.6, at: 0 });
  D.zone([2, 2, 5, 3], 'forest', { at: 0 });
  D.zone([25, 12, 6, 3], 'farm', { at: 0 });
  D.zone([1, 15, 7, 2], 'farm', { at: 0 });

  // the highway (old lanes) and the new lane built beside it
  D.road([[-2, 13.5], [34, 13.5]], { kind: 'highway', at: 0 });
  D.road([[-2, 15], [34, 15]], { kind: 'highway', at: P.c(0, 0.6), dur: 2.2 });

  // traffic: fills the new lane on cue 1, slows down on cue 2
  D.traffic({
    density: [[0, 0.35], [P.cw(1, '开车'), 0.9, 2.2]],
    speed: [[0, 1], [P.c(2, 0.2), 0.15, 2.5]],
  });

  // beat 1: push in on the widening highway
  D.flyTo([16, 14.2], P.c(0, 0.2), 2.5, { zoom: 2.2 });
  D.label([19, 15], '路多1%', { at: P.c(0, 1.6), out: P.c(2, 0.2), color: 'orange', sub: '+1% 道路' });

  // beat 2: the new lane fills up
  D.label([12, 14.2], '车多1%', { at: P.cw(1, '开车'), out: P.c(2, 0.2), color: 'orange', sub: '+1% 行驶里程' });
  P.placard(1460, 200, 1, { at: P.cw(1, '开车'), from: 0, unit: '%', sub: '车辆行驶里程', dur: 1.4 });

  // beat 3: whole highway slows and turns red, camera pulls back
  D.back(P.c(2), 2.5);
  D.highlight([0, 12.8, 32, 3], { color: 'red', at: P.c(2, 0.6) });
  D.label([16, 14.2], '基本定律', { at: P.cw(2, '基本定律'), color: 'red', sub: '道路拥堵' });

  // closing: widening can't keep up
  D.label(city, '追不上', { at: P.cw(3, '追不上'), color: 'red', sub: '新增车辆' });
});
