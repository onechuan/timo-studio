ENGINE.visual('p03', (P) => {
  P.title('One line slowly serves two');

  // The tangle carried over from the previous page
  const TX = 700, TY = 530, TS = 850;
  const h = P.held('tangle', TX, TY, TS);

  // c0: it loosens at one end — a loose loop slips out to the right
  const tLoopDone = Math.min(P.c(0, 2.2), P.c(1) - 0.2);
  const tUndraw = P.cw(1, 'hobby') - 0.4;
  P.thread([
    [1010, 560], [1150, 600], [1290, 570], [1340, 480], [1270, 420],
    [1190, 470], [1230, 560], [1370, 610], [1500, 580]
  ], { at: P.c(0, 0.6), done: tLoopDone, undraw: tUndraw, undrawDur: 1.0 });

  // c2: to keep the peace, the tangle pulls tight into a knot
  const kDone = P.cw(2, 'peace');
  const kAt = kDone - 2.0;
  const knot = P.morph(['tangle', TX, TY, TS], ['knot', TX, TY, TS], {
    mode: 'melt', at: kAt, done: kDone, from: kAt, replaces: h
  });

  // c3: untangle — the line pulls straight and becomes one huge profile
  const pAt = P.cw(3, 'untangle');
  const pDone = Math.min(P.cw(3, 'face'), P.endT - 0.9);
  P.morph(['knot', TX, TY, TS], ['profile', 640, 680, 1400], {
    mode: 'straighten', at: pAt, done: pDone, from: pAt, replaces: knot
  });

  // c3: the bare side the profile faces
  P.caption('One face left', 1180, 520, {
    at: Math.min(P.cw(3, 'one'), P.endT - 1.2), size: 52
  });
});
