ENGINE.visual('p03', (P) => {
  P.vars({ x: 'blue', '\\eta': 'green', "f'(x)": 'yellow' });
  P.title('Step against the slope', { at: -5, dur: 0.01 });

  const f = (x) => x * x;
  const A = P.plane({ x: [-4, 4, 1], y: [0, 16, 4], box: [180, 190, 1000, 600] });
  P.graph(A, f, { color: 'ink', label: 'f(x)=x^2', lx: -3.3, ldy: -50 });

  // the point: x = 3, then one step to 2.4 when the result is spoken
  const tStep = P.cw(3, 'gives');
  const xOf = (lt) => PV.keys([[tStep, 3], [tStep + 1.4, 2.4]], lt);
  P.tangent(A, f, xOf, { color: 'yellow', len: 420, slope: true, decimals: 1 });
  P.point(...A.p(3, 9), { color: 'muted', r: 9, at: tStep, dur: 0.3 });
  P.trace(A, f, xOf, { color: 'x', decimals: 1 });

  // the downhill arrow (carried over) slides into the right third and becomes the minus sign
  const FX = 1480, FY = 440;
  const [dx0, dy0] = A.p(3, 9);
  const sx = dx0 - 40, sy = dy0 + 70; // arrow tail (right end), pointing left = downhill
  const L0 = 200, L1 = 62;
  const tA0 = P.cw(0, 'against'), tA1 = tA0 + 1.3;
  const tWrite = P.c(1, 0.1);
  P.canvas(0, 0, 1920, 900, (ctx, lt) => {
    const u = PV.ease.inOut(PV.K(lt, tA0, tA1 - tA0));
    const fade = 1 - PV.K(lt, tWrite + 1.1, 0.4);
    if (fade <= 0) return;
    const tailX = sx + (FX + L1 / 2 - sx) * u;
    const y = sy + (FY - sy) * u;
    const len = L0 + (L1 - L0) * u;
    const head = 26 * (1 - u);
    const tipX = tailX - len;
    ctx.globalAlpha = fade;
    ctx.strokeStyle = '#f2f2f2';
    ctx.fillStyle = '#f2f2f2';
    ctx.lineWidth = 6 - 1.5 * u;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(tailX, y);
    ctx.lineTo(tipX + head * 0.8, y);
    ctx.stroke();
    if (head > 0.5) {
      ctx.beginPath();
      ctx.moveTo(tipX, y);
      ctx.lineTo(tipX + head, y - head * 0.55);
      ctx.lineTo(tipX + head, y + head * 0.55);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

  // the update rule, derived in place
  P.morph([
    "{{x}} {{\\leftarrow}} {{x2::x}} {{-}} {{e::\\eta}} {{f::f'(x)}}",
    "{{x}} {{\\leftarrow}} {{x2::3}} {{-}} {{e::\\textcolor{#83C167}{0.1}}} {{\\cdot}} {{f::\\textcolor{#F7D96F}{6}}}",
    "{{x}} {{=}} {{r::2.4}}",
  ], {
    x: FX, y: FY, size: 84, align: 'c', valign: 'm',
    at: tWrite, dur: 2.2,
    times: [P.cw(2, '0.1'), tStep],
  });

  // naming the step size: a brace under eta while "step size" is spoken

});
