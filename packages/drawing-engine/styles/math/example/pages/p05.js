ENGINE.visual('p05', (P) => {
  P.vars({ x: 'blue', '\\eta': 'green' });
  P.title('Too big a step');

  // the same valley: f(x) = x^2
  const f = (x) => x * x;
  const A = P.plane({ x: [-6, 6, 1], y: [0, 30, 5], box: [180, 190, 1100, 660], labels: ['x', 'f(x)'] });
  P.graph(A, f, { color: 'ink', from: -5.45, to: 5.45 });

  // the update rule on the right, eta in green
  const F = P.tex('x \\leftarrow x - {{eta::\\eta}}\\cdot 2x', { x: 1390, y: 600, size: 58, align: 'l', fixed: true });

  // eta ticks from 0.1 to 1.1
  const e0 = P.cw(0, 'eta');
  const e1 = Math.max(e0 + 1.2, P.ce(0) - 0.2);
  const eta = (lt) => PV.keys([[e0, 0.1], [e1, 1.1]], lt, PV.ease.inOut);
  P.value(1390, 300, '\\eta', eta, { decimals: 1, align: 'l', at: 0.2 });
  P.surround(F, 'eta', { at: e0, color: 'green', out: P.c(1, -0.3) });

  // the iterates: x -> x(1 - 2*1.1) = -1.2 x
  const xs = [3, -3.6, 4.32, -5.184];
  // leg 0: slide from the bottom back to x = 3 along the curve
  const s0 = P.c(1, -0.7);
  const s1 = Math.max(s0 + 1.0, P.cw(1, '3', 0.3));
  // jumps
  const j = [
    [P.cw(1, 'jumps'), 0],
    [P.cw(2, 'jumps'), 0],
    [P.cw(3, 'higher'), 0],
  ];
  j[0][1] = Math.max(j[0][0] + 1.0, P.cw(1, '3.6', 0.3));
  j[1][1] = Math.max(j[1][0] + 1.0, P.cw(2, '4.32', 0.3));
  j[2][1] = j[2][0] + 1.3;
  for (let i = 0; i < 3; i++) if (j[i][0] < (i ? j[i - 1][1] : s1) + 0.1) j[i][0] = (i ? j[i - 1][1] : s1) + 0.1;
  for (let i = 0; i < 3; i++) j[i][1] = Math.max(j[i][1], j[i][0] + 1.0);

  const sm = (u) => u * u * (3 - 2 * u);
  const pos = (lt) => {
    if (lt < s0) return [0, 0];
    if (lt < s1) { const x = 3 * sm((lt - s0) / (s1 - s0)); return [x, f(x)]; }
    let last = [3, 9];
    for (let i = 0; i < 3; i++) {
      const [a, b] = j[i];
      const xa = xs[i], xb = xs[i + 1];
      if (lt < a) return last;
      if (lt < b) {
        const u = sm((lt - a) / (b - a));
        const x = xa + (xb - xa) * u;
        const y = f(xa) + (f(xb) - f(xa)) * u + 3 * 4 * u * (1 - u);
        return [x, y];
      }
      last = [xb, f(xb)];
    }
    return last;
  };

  P.value(1390, 420, 'x', (lt) => pos(lt)[0], { decimals: 2, align: 'l', at: 0.2 });

  // landing marks with their values
  const lab = ['x=3', 'x=-3.6', 'x=4.32'];
  const off = [[26, 34, 'l'], [-22, 34, 'r'], [26, 34, 'l']];
  const land = [s1, j[0][1], j[1][1]];
  for (let i = 0; i < 3; i++) {
    const [px, py] = A.p(xs[i], f(xs[i]));
    P.point(px, py, { color: 'soft', r: 8, at: land[i] - 0.1 });
    P.tex(lab[i], { x: px + off[i][0], y: py + off[i][1], size: 48, align: off[i][2], valign: 'm', at: land[i] - 0.1, dur: 0.5 });
  }

  // dashed zigzag across the vertex, each leg longer
  const z = xs.map((x) => A.p(x, f(x)));
  P.arrow(z[0][0], z[0][1], z[1][0], z[1][1], { dashed: true, color: 'soft', sw: 2, head: 14, at: j[0][0], dur: j[0][1] - j[0][0] });
  P.arrow(z[1][0], z[1][1], z[2][0], z[2][1], { dashed: true, color: 'soft', sw: 2, head: 14, at: j[1][0], dur: j[1][1] - j[1][0] });
  P.arrow(z[2][0], z[2][1], z[3][0], z[3][1], { dashed: true, color: 'soft', sw: 2, head: 14, at: j[2][0], dur: j[2][1] - j[2][0] });

  // the blue dot, riding pos(lt)
  const [ox, oy] = A.p(0, 0);
  P.shape(PV.M.circle(ox, oy, 13), {
    color: 'x', fill: 'x', fop: 1, sw: 3,
    move: (lt) => { const [x, y] = pos(lt); const [px, py] = A.p(x, y); return { dx: px - ox, dy: py - oy }; },
  });

  // pull out to show the widening bounce
  const cz = P.cw(3, 'bounces');
  P.cam([{ at: cz, x: 960, y: 500, s: 0.9, dur: 0.9, ease: 'inOut' }]);
});
