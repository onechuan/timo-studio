ENGINE.visual('p02', (P) => {
  // Real sequence: bread sits on the carriage (up) → the lever is pushed, the carriage slides down its groove
  // → at the bottom the latch hook swings over the carriage tab and holds it → the return spring above is
  // stretched tight → the carriage foot presses the two switch blades together → current flows, lamp green.
  // Model (cm): toaster body x 3..21 (front face x = 21), y 2..32, z 2..25, on a counter board.
  // Cut-away window in the front face shows the inside; a point at depth x shows shifted by (21 - x).
  P.title('Push down: lock and switch on');

  const tPush = P.cw(0, 'Pushing');
  const tLow = P.cw(0, 'lowers');
  const tCar = P.cw(0, 'carriage');
  const tHook = P.cw(1, 'hook');
  const tCatch = P.cw(1, 'catches');
  const tSpring = P.cw(1, 'spring');
  const tClose = Math.min(P.cw(2, 'closes'), P.cw(2, 'switch') - 0.15);
  const tGreen = P.cw(3, 'green');
  const tOn = tClose + 0.05;

  P.steps(['Load bread', 'Push lever', 'Pop up'], { press: [0, tPush, P.endT + 100] });
  P.stat(1780, 200, 'CURRENT', (lt) => +(7.2 * PV.K(lt, tOn, 0.4)).toFixed(1), { unit: 'A' });

  const W = 21, T = 25;
  const BREAD = '#ecc887';

  // a coil between two heights: zigzag in y
  const coil = (D, x, y, z0, z1, n = 8, w = 0.9) => {
    const pts = [[x, y, z0]];
    for (let i = 1; i < 2 * n; i++) pts.push([x, y + (i % 2 ? w : -w), z0 + (z1 - z0) * i / (2 * n)]);
    pts.push([x, y, z1]);
    D.line(pts, 3.2, '#2a1d18');
    D.line(pts, 1.8, '#c9ced4');
  };
  // latch hook, a bent rod turning about its pivot in the (y, z) plane at depth x = 18
  const hookPts = (a) => {
    const py = 10.5, pz = 3.4;
    const rel = [[0, 0], [0, 3.2], [-4.2, 3.2], [-4.2, 2.3]];
    const c = Math.cos(a), s = Math.sin(a);
    return rel.map(([y, z]) => [18, py + y * c - z * s, pz + y * s + z * c]);
  };

  const F = P.figure({ size: [26, 34, 29], box: [260, 130, 1420, 770], at: 0, dur: 0.9 }, (D, lt) => {
    const down = D.k(tLow, 2.3, 'inOut');
    const zc = 14 - 8 * down;          // carriage plate top: 14 up, 6 down
    const lz = zc + 7;                  // lever rides with the carriage
    const snap = D.k(tCatch, 0.3, 'out');
    const hookA = -0.8 * (1 - snap);    // open → over the tab
    const close = D.k(tClose, 0.35, 'out');
    const heat = D.k(tOn, 1.6, 'out');

    // 1. board and the one shadow
    D.board(0, 0, 26, 34, 2, 4, 'board');
    const bt = D.boardTop(0, 0, 26, 34, 2, 4);
    D.shadow([[3, 2, 2], [21, 2, 2], [21, 32, 2], [3, 32, 2], [3, 2, T], [21, 2, T], [21, 32, T], [3, 32, T],
      [25.5, 3.2, lz - 1.2], [25.5, 6, lz + 1.2]], 2, bt);

    // 2. body
    D.extrude(D.rr(2, 2, 32, T, 3), 3, W, 'tomato');

    // bread sticking up out of the slots is behind the slot front lips; draw slots first
    D.shape(D.on(D.PZ(T + 0.05), D.rr(9.5, 5.5, 12.1, 25.5, 1)), '#2a1d18', 1);
    D.shape(D.on(D.PZ(T + 0.05), D.rr(14.5, 5.5, 17.1, 25.5, 1)), '#2a1d18', 1);
    if (zc + 14 > T + 0.1) {
      D.box(10, 6, T, 11.6, 25, zc + 14, BREAD);
      D.box(15, 6, T, 16.6, 25, zc + 14, BREAD);
    }

    // 3. lever groove, lamp, lever knob
    D.shape(D.on(D.PX(W + 0.05), D.rr(4, 11, 5.2, 22, 0.6)), '#2a1d18', 0.8);
    D.lamp([W + 0.05, 4.6, 7], [tOn, 999], { color: 'green', r: 1.3 });
    D.box(W, 3.2, lz - 1.2, 25.5, 6, lz + 1.2, 'dark');

    // 4. the cut-away window and what is behind it
    const win = D.on(D.PX(W + 0.06), D.rr(8, 4, 28, 23, 1.5));
    D.clip(win, () => {
      D.fill(win, '#3b2b24');
      D.fill(win, '#e8743b', 0.35 * heat);
      // carriage tray and bread
      D.box(9, 6, zc - 0.6, 18, 28, zc, 'metal');
      D.box(10, 6, zc, 11.6, 25, zc + 14, BREAD);
      D.box(15, 6, zc, 16.6, 25, zc + 14, BREAD);
      // carriage tab that the latch catches
      D.box(17, 4.5, zc - 1.2, 19, 8.5, zc, 'metal');
      // return spring: anchored above, hooked to the tab
      D.part(tSpring - 0.3, () => {
        D.box(17.5, 12, 21.5, 19, 15, 22.5, 'dark');
        coil(D, 18.5, 13.5, zc, 21.5, 10, 1.3);
      });
      // latch hook
      D.part(tHook - 0.3, () => {
        D.rod(hookPts(hookA)[0], hookPts(hookA)[1], 0.4, 'metal');
        D.rod(hookPts(hookA)[1], hookPts(hookA)[2], 0.4, 'metal');
        D.rod(hookPts(hookA)[2], hookPts(hookA)[3], 0.4, 'metal');
        D.ball(hookPts(0)[0], 0.7, 'dark');
      });
      // switch contacts at the base: fixed blade and moving blade
      D.part(tClose - 0.4, () => {
        D.box(18.5, 23, 2.5, 20.2, 26, 6.4, 'dark');
        D.box(18.8, 14, 3.0, 20, 23, 3.8, '#d9a05a');
        const zt = 5.6 - 1.8 * close;
        D.shape([[20.1, 23, 5.4], [20.1, 14, zt], [20.1, 14, zt + 0.8], [20.1, 23, 6.2]], '#d9a05a', 1.2);
        D.ball([20, 14.8, 4.1], 0.6, 'metal');
      });
    });
    D.ink(win, 1.6);
    D.glass(win, { op: 0.15, streaks: 1 });

    // 5. tags
    D.tag([16, 24, zc + 1], -330, 150, 'CARRIAGE', [tCar, tHook]);
    D.tag([18, 7, 5.6], 330, 170, 'LATCH', [tHook, tSpring]);
    D.tag([18.5, 13.5, 19], 420, -110, 'SPRING', [tSpring, tClose]);
    D.tag([20.1, 17, 4.5], -260, 200, 'SWITCH', [tClose, 999]);
  });

  const lampP = F.pt(W, 4.6, 7);
  P.note(lampP[0] + 120, lampP[1] + 40, 'green light: power on', { at: tGreen });

  const hp = F.pt(18, 8, 5);
  // the toaster's height already fills the box; a steady 1.2× framing makes it read bigger
  const cc = F.pt(13, 17, 13);
  P.cam([
    { at: 0, x: cc[0], y: cc[1], s: 1.2, dur: 0.01 },
    P.push(tHook, hp[0], hp[1], 1.5),
    { at: tSpring + 0.2, x: cc[0], y: cc[1], s: 1.2, dur: 0.35, ease: 'out' },
  ]);
});
