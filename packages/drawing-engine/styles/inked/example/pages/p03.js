ENGINE.visual('p03', (P) => {
  // Real sequence: lever down (p02), power on → current through nichrome wound on mica sheets → the wire darkens, turns orange, glows red → the bread's face browns, edges first. Toaster: body x 2..26 (front at x = 26), y 3..41, z 3..27, on a board. Inside along x: back wall 5, heater 16, bread x 18..21, front heater 23.
  P.title('Wires that glow'); const T0 = P.cw(0, 'nichrome'), T1 = P.c(1, 0.1), Tg = P.cw(1, 'glows'), Tb = P.cw(2, 'browns'), Tn = P.c(3, 0.3), K = (lt, a, d) => PV.K(lt, a, d, PV.ease.out);
  const wireCol = (D, i, lt) => D.mix(D.mix(D.mix('#9a948c', '#3d2a24', K(lt, T1 - 0.3 + i * 0.07, 0.5)), '#e0661f', K(lt, T1 + 0.25 + i * 0.07, 0.7)), '#ff3a1c', K(lt, Tg, 0.6));
  const temp = (lt) => 20 + 410 * K(lt, T1 - 0.3, Tg - T1 + 0.3) + 440 * K(lt, Tg, 1.0), brown = (lt) => K(lt, Tb - 0.1, 2.4);
  const heater = (D, xs, lt) => { const sheet = D.on(D.PX(xs - 0.2), D.rect(5, 4, 39, 26)); D.fill(sheet, '#efe3bf', 0.14); D.ink(sheet, 0.6); for (let i = 0; i < 12; i++) D.line([[xs, 7 + i * 2.7, 5], [xs, 8.3 + i * 2.7, 25]], 2.4, wireCol(D, i, lt)); };
  const F = P.figure({ size: [28, 48, 28] }, (D, lt) => {
    const top = D.boardTop(0, 1, 28, 47, 3, 4);
    D.board(0, 1, 28, 47, 3, 4);
    D.shadow([[2, 3, 3], [26, 3, 3], [26, 41, 3], [2, 41, 3], [2, 3, 27], [26, 3, 27], [26, 41, 27], [2, 41, 27], [11.5, 46, 3], [15.5, 46, 10]], 3, top);
    D.extrude(D.rr(3, 3, 41, 27, 5), 2, 26, 'tomato');                                    // body
    for (const x0 of [17.5, 10.5]) D.shape(D.on(D.PZ(27.02), D.rr(x0, 9, x0 + 4, 35, 1)), '#2a2420');   // bread slots
    D.shape(D.on(D.PY(41.02), D.rr(12.5, 6, 14.5, 24, 1)), '#2a2420'); D.box(11.5, 41, 7, 15.5, 46, 10, 'dark');   // lever, held down
    const win = D.on(D.PX(26.02), D.rr(9, 6, 38, 24, 2));                                   // the window: what is inside
    D.clip(win, () => {
      D.fill(D.on(D.PX(5), D.rect(-40, -40, 90, 90)), '#3b2e28'); D.fill(D.on(D.PZ(4), D.rect(4, 4, 26, 40)), '#5a4a40');
      D.part(T0 - 0.3, () => heater(D, 16, lt));
      D.extrude(D.rr(6, 5, 34, 22, 4), 18, 21, '#c98a45', { ink: 1.2 });
      const face = (ins) => D.on(D.PX(21.02), D.rr(6 + ins, 5 + ins, 34 - ins, 22 - ins, Math.max(1, 4 - ins * 0.3))), b = brown(lt);
      [[0.8, '#9c561c', b * 1.6], [2.2, '#a9632a', b * 1.4 - 0.25], [4.5, '#b8732f', b * 1.5 - 0.5]].forEach(([ins, c, k]) => D.shape(face(ins), D.mix('#f2e0b0', c, Math.max(0, Math.min(1, k))), 0));
      D.part(T0 - 0.3, () => heater(D, 23, lt));
    });
    D.ink(win, 1.6); D.glass(win, { op: 0.18 }); D.lamp([26.05, 6, 20], true, { color: 'red' });
    D.tag([23, 9.8, 18], 260, 40, 'NICHROME', [T1, Tb]); D.tag([21, 12, 8], 300, 110, 'BREAD', Tb);
  });
  P.steps(['Load bread', 'Press lever', 'Heat', 'Pop up'], { press: [0, 0.05, Tg, 1e4] });
  P.stat(1780, 200, 'WIRE', (lt) => Math.round(temp(lt)), { unit: '°C' });
  P.cam([P.push(Tg, ...F.pt(23, 20, 10), 1.18), P.back(Tb)]);
  P.note(1250, 820, 'red-hot, and the wire holds', { at: Tn });
});
