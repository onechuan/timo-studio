ENGINE.visual('p05', (P) => {
  // Real sequence on this page (toaster cut open at the front so the latch is visible):
  // strip hot and curling -> its tip meets the top of the latch hook -> hook pivots,
  // its nose slides off the carriage bar -> stretched spring pulls carriage (and bread) up
  // -> power switch opens: wires cool from orange to grey, red lamp off
  // -> toast tossed up out of the slots, settles half out -> "Pop up" step lit.
  // Model: body x 2..20 (front at x=20), y 2..30, z 1.5..21.5; lever on the front right.
  P.title('The strip lets go');

  const nudgeT = P.cw(0, 'nudges');
  const yankT = P.cw(1, 'yanks');
  const darkT = P.cw(1, 'dark');
  const popT = P.cw(2, 'pops');
  const feltT = P.cw(2, 'felt');

  const cl = (u) => Math.max(0, Math.min(1, u));
  const sm = (u) => { u = cl(u); return u * u * (3 - 2 * u); };
  const heat = (lt) => 1 - sm((lt - darkT) / 1.6);
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, u) => {
    const A = hx(a), B = hx(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join('');
  };

  P.steps(['Load bread', 'Lever down', 'Toast', 'Pop up'], { press: [-3, -2, -1, feltT] });
  P.stat(1780, 200, 'WIRES', (lt) => Math.round((120 + 730 * heat(lt)) / 10) * 10, { unit: '°C' });

  const F = P.figure({ size: [25, 32, 32] }, (D, lt) => {
    const h = heat(lt);
    const carZ = 4 + 6 * D.k(yankT, 0.35, 'out');
    const alpha = (28 * Math.PI / 180) * D.k(nudgeT, 0.7);
    const rot = (y, z) => {
      const dy = y - 21, dz = z - 8, c = Math.cos(alpha), s = Math.sin(alpha);
      return [21 + dy * c - dz * s, 8 + dy * s + dz * c];
    };

    // board + one shadow
    D.board(0, 0, 25, 32, 1.5, 3);
    const body = [];
    [1.5, 21.5].forEach((z) => [[2, 2], [20, 2], [20, 30], [2, 30]].forEach(([x, y]) => body.push([x, y, z])));
    D.shadow(body, 1.5, D.boardTop(0, 0, 25, 32, 1.5, 3));

    // body
    D.extrude(D.rr(2, 1.5, 30, 21.5, 3), 2, 20, 'tomato');

    // slots on top, glowing while the wires are hot
    [[7, 10], [12.5, 15.5]].forEach(([x0, x1]) => {
      D.shape(D.on(D.PZ(21.55), D.rect(x0, 6, x1, 26)), mix('#2a1d18', '#ff6a2a', 0.8 * h), 1);
    });

    // window into the mechanism
    const win = D.on(D.PX(20.03), D.rr(8, 5, 28, 19, 1.2));
    D.clip(win, () => {
      const plate = D.on(D.PX(15.5), D.rect(0, -3, 30, 24));
      D.shape(plate, '#dccaa2', 0);
      D.fill(plate, '#ff7a3a', 0.28 * h);
      const wc = mix('#77706a', '#ff5a1f', h);
      for (let i = 0; i < 10; i++) {
        const y = 3.5 + i * 2.2, pts = [];
        for (let z = 0; z <= 16; z += 1) pts.push([15.6, y + (z % 2 ? 0.55 : -0.55), z]);
        D.line(pts, 1.8, wc);
      }
      // guide rod
      D.rod([17.5, 9, -2], [17.5, 9, 23], 0.45, 'metal');
      // spring: carriage top to anchor above
      const sp = [], z0 = carZ + 1.2, z1 = 20, n = 16;
      for (let i = 0; i <= n; i++) {
        const y = i === 0 || i === n ? 11 : 11 + (i % 2 ? 0.9 : -0.9);
        sp.push([17.8, y, z0 + (z1 - z0) * i / n]);
      }
      D.line(sp, 1.6, '#5b5f66');
      // carriage bar
      D.box(16.8, 4, carZ, 18.2, 19, carZ + 1.2, 'metal');
      // strip mount
      D.box(16.6, 24, 18, 18.4, 27, 20, 'dark');
      // latch hook (pivots at its middle)
      const T = rot(21, 11.5), Cn = rot(21, 5.6), N1 = rot(18.6, 5.6), N2 = rot(18.6, 4.9);
      D.rod([17.6, T[0], T[1]], [17.6, Cn[0], Cn[1]], 0.45, 'dark');
      D.rod([17.6, Cn[0], Cn[1]], [17.6, N1[0], N1[1]], 0.45, 'dark');
      D.rod([17.6, N1[0], N1[1]], [17.6, N2[0], N2[1]], 0.45, 'dark');
      D.ball([17.8, 21, 8], 0.6, 'metal');
      // bimetal strip: curls toward the hook, then pushes its top
      const u1 = sm((lt - P.c(0, 0.3)) / Math.max(0.5, nudgeT - P.c(0, 0.3)));
      const E = alpha > 0 ? rot(21.45, 11.3) : [23.4 + (21.45 - 23.4) * u1, 12.6 + (11.3 - 12.6) * u1];
      const M = [25.5, 18.5], Cp = [25.5, E[1]];
      const curve = (off) => {
        const pts = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
          pts.push([17.2, a * M[0] + b * Cp[0] + c * E[0] + off, a * M[1] + b * Cp[1] + c * E[1]]);
        }
        return pts;
      };
      D.tube(curve(0.55), 0.3, '#c46a3a');
      D.tube(curve(0), 0.3, '#a3a9b0');
      // thin reveals of the opening
      D.shape(D.on(D.PZ(5), D.rect(19, 8, 20, 28)), D.toneI([0, 0, 1], D.mat('tomato')), 0.6);
      D.shape(D.on(D.PY(8), D.rect(19, 5, 20, 19)), D.toneI([0, 1, 0], D.mat('tomato')), 0.6);
    });
    D.glass(win, { op: 0.14, streaks: 2 });
    D.ink(win, 1.4);

    // front fittings: lever slot, lever, lamp, brand
    D.shape(D.on(D.PX(20.03), D.rr(4, 5, 5.2, 18, 0.5)), '#2a1d18', 0.8);
    const lz = carZ + 3;
    D.box(20, 3, lz, 23.5, 6.2, lz + 1.6, 'dark');
    D.lamp([20.05, 4.6, 3.3], [-1, darkT], { color: 'red' });
    D.text(20.05, 18, 3.2, 'TOASTY', 2.2, { face: 'x' });

    // toast: rides the carriage up, then is tossed and settles half out
    const u = cl((lt - popT) / 0.9);
    const hop = lt < popT ? 0 : 3 * (1 - (1 - u) * (1 - u)) + 3 * Math.sin(Math.PI * u);
    const top = 20 + (carZ - 4) + hop;
    if (top > 21.7) {
      [[7.6, 9.4], [13.1, 14.9]].forEach(([x0, x1]) => {
        D.box(x0, 7, 21.5, x1, 25, top, '#c98b3c');
        D.line([[x1, 7, top - 0.3], [x1, 25, top - 0.3]], 1.2, '#7a4a22');
      });
    }

    // labels
    D.tag([17.3, 24.2, 14], -330, -40, 'STRIP', [P.c(0), nudgeT + 0.7]);
    D.tag([17.6, 21, 7], -360, 190, 'HOOK', [nudgeT, yankT]);
    D.tag([17.8, 11, carZ + 6], 330, -60, 'SPRING', [yankT, yankT + 1.4]);
    D.tag([15.6, 5, 4], 360, 170, 'WIRES', false);
    D.part(popT + 0.3, () => D.tag([14, 9, top - 1], 300, -150, 'TOAST', feltT), { from: 'fade' });
  });

  P.cam([P.push(P.c(0, 0.9), ...F.pt(17.5, 21, 9), 1.3), P.back(yankT - 0.25)]);
});
