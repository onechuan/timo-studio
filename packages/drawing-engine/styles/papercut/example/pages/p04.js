ENGINE.visual('p04', (P) => {
  P.ground('night', { hills: true, seed: 4 });
  P.title('倒福：倒就是到');

  const FX = 1100, FY = 480;

  // the door (deep red paper) the 福 is pasted on
  P.cutout([[860, 880], [860, 250], [900, 210], [1300, 210], [1340, 250], [1340, 880]], {
    sharp: true, color: 'deep', cuts: 'none', inset: true, at: 0, enter: 'paste',
    holes: [[1060, 790, 12], [1140, 790, 12]],
  });

  // beat 1: the 福 diamond, upright — then it turns half a circle
  const L = P.layer();
  const fu = L.motif('fu', FX, FY, 400, { at: 0.3, enter: 'paste' });
  const r0 = P.c(1, 0.25), rd = 0.9;
  P.tick((lt) => {
    const st = Math.floor(lt * 12) / 12;
    const k = PV.K(st, r0, rd);
    L.wrap.style.transformOrigin = `${FX}px ${FY}px`;
    L.wrap.style.transform = `rotate(${180 * k}deg)`;
  });

  // beat 2: 倒 = 到
  P.banner('倒 = 到', 1420, 260, { size: 56, at: P.cw(1, '同音'), enter: 'paste' });

  // beat 3: the child sees it, raises its arms and hops
  P.figure('child', 440, 860, 480, { pose: 'raise', at: P.c(2, 0.1), enter: 'unfold', hop: 10 });

  // beat 4: it turns to gold foil and sways — 福到了
  fu.hide(P.c(3, 0.1), 0.15);
  L.motif('fu', FX, FY, 400, { color: 'gold', at: P.c(3, 0.1), enter: 'paste', sway: 4 });
  P.banner('福到了', 1420, 660, { size: 60, at: P.cw(3, '福到了'), enter: 'paste' });
  P.scraps({ kind: 'confetti', at: P.cw(3, '福到了', 0.2), count: 50 });

  P.cam([
    P.push(P.cw(1, '同音', -0.2), FX, FY, 1.12),
    P.back(P.c(3)),
  ]);
});
