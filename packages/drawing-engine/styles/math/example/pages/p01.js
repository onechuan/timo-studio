ENGINE.visual('p01', (P) => {
  P.vars({ x: 'blue', f: 'yellow' });
  P.title('Finding the bottom blind');

  // the stage: a plane, created at once
  const A = P.plane({ x: [-4, 4, 1], y: [-1, 10, 2], box: [200, 170, 1100, 640], labels: ['x', 'y'], at: 0, dur: 0.9 });

  // c0: the valley f(x) = x^2, drawn along its length
  const f = (x) => x * x;
  P.graph(A, f, { from: -3.15, to: 3.15, color: 'muted', at: P.c(0, 0.5), dur: 1.8 });
  P.graph(A, f, { from: 2.5, to: 3.15, color: 'f', at: P.c(0, 1.9), dur: 0.4 });
  const gMain = P.graph(A, f, { from: -3.15, to: 3.15, color: 'f', at: P.c(0, 0.5), dur: 1.8 });
  gMain.hide(P.cw(2, 'cannot'), 0.9);
  P.tex('f(x) = x^2', { x: 1590, y: 300, size: 88, align: 'c', valign: 'm', at: P.c(0, 1.2), dur: 1.0 });

  // c1: the point at x = 3, with its drop line
  P.trace(A, f, () => 3, { at: P.cw(1, 'point'), color: 'x', decimals: 0 });
  P.value(1590, 470, 'x', () => 3, { at: P.cw(1, 'point', 0.1), decimals: 0, size: 64, align: 'c' });

  // c2: everything outside a small window around the dot dims
  // c3: a dashed ring pulses once around the vertex
  const smooth = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  const CX = 140, CY = 170;
  const [dx, dy] = A.p(3, 9);
  const [vx, vy] = A.p(0, 0);
  const tDim = P.cw(2, 'cannot');
  const tRing = P.cw(3, 'lowest', -0.2);
  P.canvas(CX, CY, 1220, 730, (ctx, lt) => {
    ctx.clearRect(0, 0, 1220, 730);
    const u = (lt - tRing) / 1.2;
    if (u > 0) {
      const g = smooth(u);
      // grows past its size once, then settles
      const pulse = u < 1 ? 1 + 0.25 * Math.sin(Math.PI * Math.min(1, u)) : 1;
      ctx.save();
      ctx.strokeStyle = 'rgba(240,240,240,0.95)';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.globalAlpha = g;
      ctx.beginPath();
      ctx.arc(vx - CX, vy - CY - 4, 70 * pulse * (0.4 + 0.6 * g), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, { at: 0 });
});
