ENGINE.visual('p01', (P) => {
  // Real object: a two-slot pop-up toaster on a wooden counter.
  // Body ~64 wide (y), 40 deep (x), 46 tall; two long slots across the top run along y.
  // Lever rides in a groove on the left side (+y); browning dial on the front (+x).
  // Sequence on this page: bread dropped into the slots, resting on the carriage;
  // the heating wires wait cold on the slot walls below.
  P.title('How a toaster knows');

  const tBread = P.cw(0, 'bread', -0.1);
  const tTags = P.cw(1, 'watching', -0.3);
  const tIn = P.c(2, -0.25);

  P.steps(['Drop bread', 'Push lever', 'Toast', 'Pop up'], { press: [P.cw(0, 'drop')] });

  const Z0 = 3, ZT = 49;                 // body bottom (on the board) and top
  const BX0 = 4, BX1 = 44, BY0 = 6, BY1 = 70;
  const slots = [[10, 20], [26, 36]];    // slot x ranges, back then front
  const SY0 = 12, SY1 = 64;

  const F = P.figure({ size: [50, 80, 62], at: 0.05, dur: 1.0 }, (D, lt) => {
    // 1. counter + cast shadow
    D.board(0, 0, 50, 80, Z0, 5, 'wood');
    const top = D.boardTop(0, 0, 50, 80, Z0, 5);
    D.shadow([
      [BX0, BY0, Z0], [BX1, BY0, Z0], [BX1, BY1, Z0], [BX0, BY1, Z0],
      [BX0, BY0, ZT], [BX1, BY0, ZT], [BX1, BY1, ZT], [BX0, BY1, ZT],
    ], Z0, top);

    // 2. the body
    D.extrude(D.rr(BY0, Z0, BY1, ZT, 8), BX0, BX1, 'tomato');

    // 3. slots, and what waits inside them
    slots.forEach(([x0, x1]) => {
      const open = D.on(D.PZ(ZT), D.rect(x0, SY0, x1, SY1));
      D.shape(open, '#2a1d17', 1);
      D.clip(open, () => {
        // back wall of the slot, darker deeper down
        D.fill(D.on(D.PX(x0 + 0.2), D.rect(SY0, ZT - 22, SY1, ZT)), '#3b2a22');
        // cold heating wire zig-zag on the wall
        for (let row = 0; row < 3; row++) {
          const zc = ZT - 4 - row * 5;
          const pts = [];
          for (let y = SY0 + 1; y <= SY1 - 1; y += 2.5) {
            pts.push([x0 + 0.4, y, zc + ((Math.round((y - SY0) / 2.5) % 2) ? 1.2 : -1.2)]);
          }
          D.line(pts, 0.8, '#b0603c');
        }
        // the gap in front of the slice: deep dark, heater wires waiting in it
        const gx0 = x0 + 4.3, gx1 = x1;
        D.part(tIn, () => {
          D.fill(D.on(D.PZ(ZT - 0.1), D.rect(gx0, SY0, gx1, SY1)), '#0d0705');
          for (let w = 0; w < 3; w++) {
            const xw = gx0 + 1.2 + w * 1.4, zc = ZT - 0.5;
            const pts = [];
            for (let y = SY0 + 1, k = 0; y <= SY1 - 1; y += 2.5, k++) pts.push([xw + (k % 2 ? 0.35 : -0.35), y, zc]);
            D.line(pts, 2.8, '#ff8a3a');
          }
        }, { from: 'fade', dur: 0.5 });
      });
      D.ink(open, 1.2);
    });

    // bread: one slice per slot, resting proud of the top
    slots.forEach(([x0, x1], i) => {
      const xc = x0 + 2.5, th = 1.8;
      D.part(tBread + i * 0.3, () => {
        const prof = [[SY0 + 3, ZT], [SY1 - 3, ZT], [SY1 - 3, ZT + 8], [SY1 - 7, ZT + 12],
          [SY0 + 7, ZT + 12], [SY0 + 3, ZT + 8]];
        D.extrude(prof, xc - th, xc + th, '#f1dfb4', { ink: 2.2 });
        // crust line along the rounded top
        D.line(D.on(D.PX(xc + th), [[SY1 - 3, ZT + 8], [SY1 - 7, ZT + 12], [SY0 + 7, ZT + 12], [SY0 + 3, ZT + 8]]),
          2, '#c98f4a');
      }, { from: 'drop', dur: 0.7 });
    });

    // 4. front fittings: brand, dial with its scale, lamp
    D.text(BX1, 26, 34, 'TOASTY', 4.5, { face: 'x', color: '#f6efe0' });
    D.cylX(BX1, BX1 + 3, 56, 16, 5, 'dark');
    D.line([[BX1 + 3.05, 56, 16], [BX1 + 3.05, 56, 20]], 1.4, '#f6efe0');
    D.text(BX1, 63.5, 9, '1', 2.6, { face: 'x', color: '#f6efe0' });
    D.text(BX1, 48.5, 9, '6', 2.6, { face: 'x', color: '#f6efe0' });
    D.lamp([BX1, 56, 26], false, { color: 'red' });

    // side lever: groove on the left face, handle up (not pushed yet)
    D.shape(D.on(D.PY(BY1), D.rr(22, 12, 26, 44, 2)), '#2a1d17', 1);
    D.box(19, BY1, 39, 29, BY1 + 7, 44, 'dark');

    // 5. labels
    D.part(tTags, () => D.tag([24, BY1 + 7, 42], -230, -40, 'LEVER'));
    D.part(P.c(1, 0.2), () => D.tag([BX1 + 3, 56, 11], 140, 60, 'DIAL'), { from: 'fade', dur: 0.4, out: P.c(2, 0.05) });
    D.part(P.c(3, 0.45), () => D.tag([BX1 + 3, 56, 11], 140, 60, 'DIAL'), { from: 'fade', dur: 0.3 });
    D.part(tIn, () => D.tag([32.9, 22, ZT - 0.5], 240, -130, 'WIRES'), { from: 'fade', dur: 0.4 });
  });

  // look into the slot where the answer waits, then back to the whole toaster
  P.cam([P.push(P.c(2, 0.1), ...F.pt(30, 38, ZT + 2), 1.2), P.back(P.c(3, 0.2))]);

  const np = F.pt(BX1, BY0, ZT + 6);
  P.note(np[0] + 40, np[1] - 40, 'no clock inside', { at: P.c(3, 0.6) });
});
