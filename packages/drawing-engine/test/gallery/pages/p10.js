// gauges.js — tank, gauge, loopRing, stampF
ENGINE.visual('p10', (P) => {
  P.title('gauges.js · tank / gauge / loopRing / stampF');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.tank(200, 280, 220, 480, (lt) => [{ v: 40, color: 'blue' }, { v: 70 * PV.K(lt, t1, 1.4), color: 'orange' }], { cap: 100, at: t0, fmt: (v) => Math.round(v) + '%' });
  P.gauge(800, 620, 240, (lt) => 0.15 + 0.7 * PV.K(lt, t1, 1.2), { at: t0, zones: [[0, 0.6, 'green'], [0.6, 0.85, 'orange'], [0.85, 1, 'red']], label: (lt) => Math.round(100 * (0.15 + 0.7 * PV.K(lt, t1, 1.2))) + '' });
  P.loopRing(1420, 520, 220, ['想', '做', '看'], { at: t0, nodeD: 130, pos: (lt) => (lt < t1 ? null : (lt - t1) * 0.4) });
  P.stampF(800, 330, '通过', { at: t2 });
});
