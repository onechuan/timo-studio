// switches.js — mtag, breaker, hbar, loopTrack, door
ENGINE.visual('p24', (P) => {
  P.title('switches.js · breaker / hbar / loopTrack / door / mtag');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.breaker(200, 340, { at: t0, trip: t2, label: '总闸' });
  P.hbar(480, 340, 560, 70, (lt) => 120 * PV.K(lt, t1, 1.6), { max: 100, at: t0, over: true, marks: [[80, '警戒', 'orange']], fmt: (v) => Math.round(v) + '%', color: (v) => (v > 80 ? 'orange' : 'blue') });
  P.mtag(480, 560, 220, 'a1b2c3', { at: t0 });
  P.loopTrack(1440, 520, 300, 200, [{ a: 0, label: '想' }, { a: 0.33, label: '做', color: 'orange' }, { a: 0.66, label: '看', color: 'green' }], { at: t0, pos: (lt) => (lt < t1 ? null : (lt - t1) * 0.35) });
  P.door(480, 720, '提前离开', { at: t0, on: t2 });
});
