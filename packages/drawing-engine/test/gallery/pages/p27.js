// waffle.js — waffle
ENGINE.visual('p27', (P) => {
  P.title('waffle.js · waffle');
  const t0 = P.c(0), t1 = P.c(1);
  P.waffle(560, 260, 20, 10, 40, { at: t0, state: (i, lt) => (i < 64 ? ['faint', 'orange', PV.K(lt, t1 + i * 0.01, 0.4)] : ['faint', 'faint', 0]) });
});
