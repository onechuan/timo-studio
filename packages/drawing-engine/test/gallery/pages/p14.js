// meters.js — hist, meter, clock
ENGINE.visual('p14', (P) => {
  P.title('meters.js · hist / meter / clock');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const data = [40, 60, 90, 140, 260, 120, 80, 60, 50, 40];
  P.hist({ x: 160, y: 300, w: 760, h: 400, data, ok: data.map((v) => Math.min(v, 100)), bin: 1, span: 10, cap: 100, maxV: 180, tick: 2, at: t0, clock: (lt) => 10 * PV.K(lt, t1, 2.4, 'lin') });
  P.meter(1120, 300, 90, 420, (lt) => 0.95 * PV.K(lt, t1, 1.6), { at: t0, label: '水位' });
  P.clock(1560, 500, 300, (lt) => (lt - t0) / 4, { at: t0 });
});
