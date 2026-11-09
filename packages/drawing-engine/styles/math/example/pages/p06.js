ENGINE.visual('p06', (P) => {
  P.vars({ x: 'blue', f: 'yellow' });
  P.title('Small steps reach the bottom', { at: -10 });

  // carried over: the plane and the valley f(x) = x^2
  const A = P.plane({ x: [-4, 4, 1], y: [0, 10, 2], box: [200, 190, 1100, 660], labels: ['x', 'y'] });
  const f = (x) => x * x;
  P.graph(A, f, { from: -3.15, to: 3.15, color: 'f' });

  const smooth = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };

  // the old overshooting zigzag (eta = 1.1): x -> -1.2 x, fades to muted on "small"
  const zig = [1.5];
  for (let i = 0; i < 4; i++) zig.push(zig[i] * -1.2);
  const tSmall = P.cw(0, 'small');
  P.canvas(0, 0, 1920, 1080, (ctx, lt) => {
    ctx.clearRect(0, 0, 1920, 1080);
    const k = smooth((lt - tSmall) / 1.0);
    ctx.save();
    ctx.strokeStyle = `rgba(236,236,236,${0.8 - 0.6 * k})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 9]);
    ctx.beginPath();
    zig.forEach((x, i) => {
      const [px, py] = A.p(x, f(x));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }, { at: 0 });

  // the update rule, top right
  const rule = P.tex("{{r::x \\leftarrow x - \\eta\\, f'(x)}}", { x: 1590, y: 300, size: 58, align: 'c', valign: 'm' });

  // c0: eta ticks back down from 1.1 to 0.1
  const eta = (lt) => 1.1 - 1.0 * smooth((lt - tSmall) / 1.1);
  P.value(1590, 470, '\\eta', eta, { decimals: 1, size: 64, align: 'c', color: 'ink' });

  // c1: from x = 3, steps of eta = 0.1 (x -> 0.8 x), shrinking, to the bottom
  const xs = [3];
  for (let i = 0; i < 12; i++) xs.push(xs[i] * 0.8);
  xs.push(0);
  const t0 = P.cw(1, 'From', 0.2);
  const t1 = Math.min(P.cw(1, 'bottom', 0.2), P.c(2) - 0.6);
  const n = xs.length - 1;
  const d = (t1 - t0) / n;
  const xOf = (lt) => {
    if (lt <= t0) return 3;
    if (lt >= t1) return 0;
    const s = (lt - t0) / d;
    const i = Math.min(n - 1, Math.floor(s));
    const u = smooth((s - i) / 0.8);
    return xs[i] + (xs[i + 1] - xs[i]) * u;
  };
  P.trace(A, f, xOf, { color: 'x', readout: false });
  P.value(1590, 620, 'x', xOf, { decimals: 1, size: 64, align: 'c' });

  // footprints left at each step
  for (let i = 1; i < n; i++) {
    const [px, py] = A.p(xs[i], f(xs[i]));
    P.point(px, py, { at: t0 + d * i, color: 'x', r: 5 });
  }
  const [vx, vy] = A.p(0, 0);
  P.point(vx, vy, { at: t1, color: 'x', r: 11 });
  P.tex('x = 0', { x: A.X(-0.8), y: A.Y(2.3), size: 52, align: 'c', valign: 'm', at: t1 + 0.1, dur: 0.6 });

  // c2: the rule boxed in blue and held
  P.surround(rule, 'r', { at: P.cw(2, 'against', -0.1), color: 'x', dur: 0.7 });
});
