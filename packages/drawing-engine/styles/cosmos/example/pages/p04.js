ENGINE.visual('p04', (P) => {
  const S = P.space({ target: [0, 0, 0], dist: 90, az: 20, el: 28, drift: 2, nebula: 'violet' });
  P.title('比邻星');

  // the solar system, alive from the first frame
  const sys = S.system({ at: 0, labels: false });
  S.label(sys.sun, '太阳系', { at: 0.2, color: 'orange', out: P.cw(0, '比邻星') + 0.6 });

  // beat 1: huge pull-back, the planets' orbits fold into one bright point
  S.cameraTo([0, 0, 0], 1400, P.c(0, 0.1), 2.6, { el: 18 });

  // beat 2: a dim red dwarf lights up far away; camera swings toward it
  const tProx = P.cw(0, '比邻星');
  const PROX = [2600, 160, -1300];
  const prox = S.body({ kind: 'star', color: 'red', temp: 3000, name: '比邻星' }, { r: 26, pos: PROX, at: tProx - 0.2 });
  S.label(prox, '比邻星', { at: tProx + 0.4, sub: '4.2 光年', color: 'red' });
  S.label(sys.sun, '太阳', { at: tProx + 0.9, color: 'orange' });
  S.cameraTo([1300, 80, -650], 3600, tProx, 2.2, { el: 14 });

  // beat 3: a light pulse leaves Proxima and creeps along the long ranging line
  const t42 = P.cw(1, '4.2');
  S.measure(prox, sys.sun, '4.2 光年', { at: P.c(1) });
  S.path([prox, sys.sun], { at: t42, dur: Math.max(3, P.endT + 0.6 - t42), color: 'yellow', label: '4.2年' });

  // camera tracks along the ranging line with the pulse
  S.cameraTo([2000, 120, -1000], 2600, t42, 1.8, { el: 12 });
  S.cameraTo([1100, 60, -550], 3900, P.c(2, 0.2), 2.4, { el: 16 });

  // the number that matters
  P.readout(1200, 790, 4.2, {
    caption: '光的旅程', unit: '年', color: 'orange',
    fmt: (v) => v.toFixed(1), dur: 1.2, at: P.cw(1, '4.2') - 1.0,
  });
});
