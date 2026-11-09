ENGINE.visual('p04', (P) => {
  P.vars({ x: 'blue', f: 'yellow' });
  const f = (x) => x * x;
  const E = PV.ease.inOut;

  // carried over: the plane, the valley, the formula, the x readout
  const A = P.plane({ x: [-4, 4, 1], y: [0, 10, 2], box: [200, 170, 1100, 580], labels: ['x', 'y'] });
  P.graph(A, f, { from: -3.15, to: 3.15, color: 'f' });
  P.tex('f(x) = x^2', { x: 1590, y: 300, size: 88, align: 'c', valign: 'm', fixed: true });

  // ---- the walk: x as one function of time ----
  const moves = []; // [start, dur, from, to]
  const tFirst = P.cw(1, '1.92') - 0.7;
  moves.push([tFirst, 0.7, 2.4, 1.92]);
  let xc = 1.92;
  const t0 = P.c(2, 0.15), t1 = P.c(4) - 0.2;
  const nSteps = 8, gap = (t1 - t0) / nSteps;
  for (let i = 0; i < nSteps; i++) {
    const nx = +(xc - 0.1 * 2 * xc).toFixed(4);
    moves.push([t0 + i * gap, Math.min(0.5, gap * 0.7), xc, nx]);
    xc = nx;
  }
  const tStop = P.cw(4, 'stops');
  const lastStart = P.c(4, 0.1);
  moves.push([lastStart, Math.max(0.8, tStop - lastStart), xc, 0]);

  const xOf = (lt) => {
    let v = 2.4;
    for (const [s, d, a, b] of moves) {
      if (lt >= s + d) v = b;
      else if (lt > s) { v = a + (b - a) * E((lt - s) / d); break; }
      else break;
    }
    return v;
  };

  // tangent slope: swings from the old 6 to 4.8 at the start, then follows 2x
  // tangent and readout swing together: 6 → 4.8 landing on the word, then follow 2x
  const tRead = P.cw(1, '4.8');
  const sw0 = Math.max(0.3, tRead - 1.3);
  const readOf = (lt) => {
    if (lt < sw0) return 6;
    if (lt < tRead) return 6 + (4.8 - 6) * E((lt - sw0) / (tRead - sw0));
    return 2 * xOf(lt);
  };
  const slopeOf = readOf;

  // footprints left behind
  moves.forEach(([s, , a]) => {
    P.point(...A.p(a, f(a)), { color: 'muted', r: 7, at: s + 0.05 });
  });

  // the tangent line, exact, riding the dot
  const cs = getComputedStyle(document.documentElement);
  const YEL = (cs.getPropertyValue('--yellow') || '').trim() || '#f2cf4a';
  P.canvas(0, 0, 1920, 1080, (ctx, lt) => {
    ctx.clearRect(0, 0, 1920, 1080);
    const x = xOf(lt), s = slopeOf(lt);
    // a segment of ±1 unit of run, shortened when steep so it stays ~ the same length
    const run = 170 / Math.sqrt(1 + (s * A.uy / A.ux) ** 2) / A.ux;
    const [ax, ay] = A.p(x - run, f(x) - s * run);
    const [bx, by] = A.p(x + run, f(x) + s * run);
    ctx.strokeStyle = YEL; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  });

  // the dot with drop lines and its coordinates
  P.trace(A, f, xOf, { color: 'x', decimals: 2 });

  // readouts on the right
  P.tex("x \\leftarrow x - 0.1\\,f'(x)", { x: 1400, y: 390, size: 52, align: 'l', at: P.c(1, 0.3), dur: 1.0, fixed: true });
  P.value(1400, 480, 'x', xOf, { decimals: 2, size: 64, align: 'l' });
  P.value(1400, 600, "f'(x)", readOf, { decimals: 1, size: 64, align: 'l', color: 'f' });
  P.tex("f'(0) = 0", { x: 1400, y: 150, size: 64, align: 'l', at: tStop, dur: 0.8, fixed: true });

  // zoom on the vertex as it stops, then the whole again
  const [vx, vy] = A.p(0, 0);
  P.cam([
    { at: tStop - 0.3, x: vx, y: vy - 120, s: 1.6, dur: 0.9, ease: 'inOut' },
    { at: P.endT - 1.0, x: 960, y: 540, s: 1, dur: 0.9, ease: 'inOut' },
  ]);
});
