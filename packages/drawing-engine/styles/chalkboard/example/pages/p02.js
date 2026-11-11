/* p02 Squares: a square traced outward on the short leg and split into 9 cells, then a 16-cell square on the long leg. */
ENGINE.visual('p02', (P) => {
  P.title('每条边一个正方形', { accent: 'yellow' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const u = 80, R = { x: 760, y: 500 }, A = { x: R.x, y: R.y - 3 * u }, B = { x: R.x + 4 * u, y: R.y };
  // the triangle is still on the board from the last page
  P.path(`M${A.x} ${A.y} L${R.x} ${R.y} L${B.x} ${B.y} Z`, { at: 0, dur: 0.01 });
  /** square of n×n cells at (x, y), outline at t, grid lines after it */
  const square = (x, y, n, color, t, gridAt) => {
    P.rect(x, y, n * u, n * u, { color, at: t, dur: 0.8 });
    for (let i = 1; i < n; i++) {
      P.line(x + i * u, y, x + i * u, y + n * u, { color, sw: 2, at: gridAt + (i - 1) * 0.18, dur: 0.3 });
      P.line(x, y + i * u, x + n * u, y + i * u, { color, sw: 2, at: gridAt + (n - 1 + i - 1) * 0.18, dur: 0.3 });
    }
  };
  square(A.x - 3 * u, A.y, 3, 'yellow', t0 + 0.2, t1 - 0.2);
  P.text('9', { x: A.x - 1.5 * u - 18, y: A.y + 1.5 * u - 50, size: 76, weight: 700, color: 'yellow', at: P.cw(1, '九格'), cps: 6 });
  square(R.x, R.y, 4, 'blue', t2 - 0.4, t2 + 0.3);
  P.text('16', { x: R.x + 2 * u - 36, y: R.y + 2 * u - 50, size: 76, weight: 700, color: 'blue', at: P.cw(2, '十六格'), cps: 6 });
  P.text('3 × 3 = 9', { x: A.x - 3 * u - 320, y: A.y + 1.5 * u - 32, size: 52, weight: 700, color: 'soft', at: P.cw(1, '三乘三'), cps: 10 });
  P.text('4 × 4 = 16', { x: R.x + 4 * u + 40, y: R.y + 2 * u - 32, size: 52, weight: 700, color: 'soft', at: P.cw(2, '四乘四'), cps: 10 });
  P.cam([P.push(t1, A.x - 1.5 * u, A.y + 1.5 * u + 60, 1.12), P.pan(t2, R.x + 2 * u, R.y + 1.2 * u), P.back(P.cw(2, '十六格', 1.2))]);
});
