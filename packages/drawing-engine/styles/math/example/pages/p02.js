ENGINE.visual('p02', (P) => {
  P.vars({ x: 'blue' });

  const f = (x) => x * x;
  // the valley, carried over: plane, curve and the dot at x = 3
  const A = P.plane({ x: [-4, 5, 1], y: [-3, 15, 3], box: [180, 190, 1100, 660], labels: ['x', 'y'] });
  P.graph(A, f, { from: -3.85, to: 3.85, color: 'ink' });
  P.trace(A, f, () => 3, { color: 'ink', drop: true, readout: true, decimals: 0 });

  // 1. the slope the point can feel: a yellow tangent at the dot
  P.tangent(A, f, () => 3, { at: P.cw(0, 'slope', -0.3), color: 'yellow', len: 520, slope: false });

  // 2-3. f'(x) = 2x, then substitute x = 3 → 6
  const m = P.morph([
    "{{fp::f^{\\prime}}} {{lp::(}} {{arg::x}} {{rp::)}} {{eq::=}} {{two::2}} {{rhs::x}}",
    "{{fp::f^{\\prime}}} {{lp::(}} {{arg::3}} {{rp::)}} {{eq::=}} {{two::2}} {{rhs::\\cdot 3}}",
    "{{fp::f^{\\prime}}} {{lp::(}} {{arg::3}} {{rp::)}} {{eq::=}} {{six::6}}",
  ], {
    x: 1590, y: 300, size: 84, align: 'c',
    at: P.c(1, 0), dur: 0.8,
    times: [P.c(2, -0.4), P.cw(2, '6', -0.2)], tdur: 0.9,
  });
  P.surround(m, 'six', { at: P.cw(2, '6', 1.0), step: 2, color: 'yellow' });

  // 4-5. direction arrows along the x-axis, from the dot's x
  const x0 = A.X(3);
  const ay = A.Y(0) + 55;
  P.arrow(x0, ay, A.X(4.7), ay, { at: P.cw(3, 'right', -0.4), dur: 0.7, color: 'yellow', sw: 6, head: 26 });
  P.tex('\\text{uphill}', { x: A.X(4.0), y: ay + 14, size: 44, color: 'yellow', align: 'c', at: P.cw(3, 'rises', 0) });

  P.arrow(x0 - 10, ay, A.X(-0.2), ay, { at: P.cw(4, 'left', -0.5), dur: 0.8, color: 'ink', sw: 6, head: 26 });
  P.tex('\\text{downhill}', { x: A.X(0.9), y: ay + 14, size: 44, color: 'ink', align: 'c', at: P.cw(4, 'downhill', 0) });
});
