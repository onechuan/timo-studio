ENGINE.visual('p04', (P) => {
  // Real sequence (inside the toaster, heating already on):
  // wires glow on the mica card -> heat reaches the bimetal strip (brass bonded to steel)
  // -> brass expands more than steel -> strip curls toward the latch's trip finger
  // -> the browning dial slides the trip finger farther away -> a longer bend is needed.
  // Close-up assembly: mica card + wire (back), strip on its post (middle),
  // latch post + arm + trip finger (left), control panel + dial (front right).
  P.title('The strip that keeps time');

  const tS = Math.min(P.cw(1, 'stretches'), P.c(1, 0.3)), tC = P.cw(1, 'curl');
  const tD = P.cw(2, 'dial'), tL = P.cw(3, 'longer');
  const sm = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  const curl = (lt) => 0.55 * sm((lt - tS) / 4.2) + 0.45 * sm((lt - tL) / (P.endT - 0.6 - tL)); // 0..1 bend
  const ext = (lt) => 4.5 * sm((lt - tS) / 2.0); // brass (outer layer) runs past steel
  const temp = (lt) => 60 + 125 * curl(lt);
  const dialK = (lt) => sm((lt - tD) / 1.2);
  const fingerY = (lt) => 88 + 11 * dialK(lt);

  P.steps(['Load bread', 'Push lever', 'Heat', 'Pop up'], { press: [-2, -1, 0.2, 9999] });
  P.stat(1780, 200, 'STRIP', (lt) => Math.round(temp(lt)), { unit: '°C' });

  const L = 44, U0 = 66, V0 = 12, SX = 33.2, TH = 4.2;
  function ribbon(len, k, o0, o1) {
    const a = [], b = [], N = 18;
    for (let i = 0; i <= N; i++) {
      const s = (len * i) / N, th = k * s;
      const cu = k < 1e-6 ? U0 : U0 + (1 - Math.cos(th)) / k;
      const cv = k < 1e-6 ? V0 + s : V0 + Math.sin(th) / k;
      const nu = Math.cos(th), nv = -Math.sin(th);
      a.push([cu + nu * o0, cv + nv * o0]);
      b.push([cu + nu * o1, cv + nv * o1]);
    }
    return a.concat(b.reverse());
  }
  function stripPoint(lt, s, off) {
    const k = 0.02 * curl(lt), th = k * s;
    const cu = k < 1e-6 ? U0 : U0 + (1 - Math.cos(th)) / k;
    const cv = k < 1e-6 ? V0 + s : V0 + Math.sin(th) / k;
    return [SX, cu + Math.cos(th) * off, cv - Math.sin(th) * off];
  }

  const F = P.figure({ size: [44, 110, 72] }, (D, lt) => {
    const top = D.boardTop(0, 0, 42, 110, 3, 5);
    D.board(0, 0, 42, 110, 3, 5, 'board');
    const bx = (x0, y0, z0, x1, y1, z1) => [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    D.shadow(bx(5, 4, 3, 8, 56, 70), 3, top);
    D.shadow(bx(27, 60, 3, 34, 72, 58), 3, top);
    D.shadow(bx(18, 102, 3, 26, 108, 65), 3, top);
    D.shadow(bx(34, 2, 3, 38, 40, 36), 3, top);

    // mica card with the glowing heating wire (on all page: heating runs)
    D.box(5, 4, 3, 8, 56, 70, '#efe3c4');
    D.hullInk(bx(5, 4, 3, 8, 56, 70));
    const wire = [];
    for (let i = 0; i < 8; i++) {
      const z = 12 + i * 7.5, l = i % 2 === 0;
      wire.push([8.3, l ? 9 : 51, z], [8.3, l ? 51 : 9, z]);
    }
    D.line(wire, 1.9, '#e8552e');

    // strip post and the bimetal strip (steel inside the curve, brass outside)
    // latch post and arm (behind the strip in depth)
    D.box(18, 102, 3, 26, 108, 65, 'metal');
    D.box(18, 80, 59, 26, 102, 65, 'metal');
    D.hullInk(bx(18, 80, 59, 26, 108, 65).concat(bx(18, 102, 3, 26, 108, 65)));
    const fy = fingerY(lt);
    // trip finger reaches forward from the arm to the strip's plane
    D.box(22, fy, 44, 33, fy + 4, 59, 'dark');
    D.hullInk(bx(22, fy, 44, 33, fy + 4, 59), 2);

    D.box(27, 60, 3, 33, 72, 13, 'dark');
    D.hullInk(bx(27, 60, 3, 33, 72, 13));
    const k = 0.02 * curl(lt);
    D.shape(D.on(D.PX(SX), ribbon(L + ext(lt), k, -TH, 0)), '#c8602a', 1.6);
    D.shape(D.on(D.PX(SX), ribbon(L, k, 0, TH)), '#c9d2da', 1.6);
    D.ball([SX + 0.6, 66, 9], 1.8, 'metal');

    // control panel with the browning dial
    D.box(34, 2, 3, 38, 40, 36, 'tomato', { shade: 'sun' });
    D.hullInk(bx(34, 2, 3, 38, 40, 36));
    D.text(38.1, 32, 31, 'LIGHT', 3);
    D.text(38.1, 9, 31, 'DARK', 3);
    D.cylX(38, 42, 20, 17, 8, 'ceramic');
    const a = (-50 + 100 * dialK(lt)) * Math.PI / 180;
    D.line([[42.1, 20, 17], [42.1, 20 - 7 * Math.sin(a), 17 + 7 * Math.cos(a)]], 3.2);

    // labels
    const bOn = (lt >= tS && lt < tS + 4.3) || lt >= tL;
    D.tag([SX, 68, 22], -190, 200, 'BIMETAL', bOn);
    D.part(tS - 0.3, () => {
      D.tag(stripPoint(lt, 40, -2), 90, -190, 'BRASS', false);
      D.tag(stripPoint(lt, 30, 2), -170, -230, 'STEEL', false);
    }, { from: 'fade', out: tD - 0.3 });
    D.part(tD - 0.3, () => {
      D.tag([28, fy + 4, 46], -170, 150, 'TRIP', false);
      D.tag([42, 14, 10], 150, 80, 'DIAL', [tD, tD + 1.4]);
    }, { from: 'fade' });
  });

  P.text('DARKER = FARTHER', { x: 1180, y: 842, size: 38, font: 'mono', color: 'ink', align: 'c', at: tD + 0.2, cps: 30 });

  P.cam([P.push(tS + 1.0, ...F.pt(SX, 80, 50), 1.3), P.back(tD - 0.2)]);
});
