/* p03 Moving the cells: an empty 5×5 square traced on the right; 9 yellow and 16 blue cells fly in one by one to fill it; a 5 written on its side, underlined twice. */
ENGINE.visual('p03', (P) => {
  P.title('九加十六', { accent: 'yellow' });
  const { lerp, clamp, ease } = PV;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2), t3 = P.c(3);
  const u = 70, R = { x: 600, y: 480 }, A = { x: R.x, y: R.y - 3 * u }, B = { x: R.x + 4 * u, y: R.y };
  const S = { x: 1150, y: 230 };   // the 5×5 target square
  P.path(`M${A.x} ${A.y} L${R.x} ${R.y} L${B.x} ${B.y} Z`, { at: 0, dur: 0.01 });
  P.rect(A.x - 3 * u, A.y, 3 * u, 3 * u, { color: 'yellow', at: 0, dur: 0.01 });
  P.rect(R.x, R.y, 4 * u, 4 * u, { color: 'blue', at: 0, dur: 0.01 });
  P.rect(S.x, S.y, 5 * u, 5 * u, { color: 'ink', at: t0 + 0.2, dur: 0.9 });
  // targets: the 3×3 corner first, then the L-shaped rest
  const corner = [], rest = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) (r < 3 && c < 3 ? corner : rest).push([S.x + c * u, S.y + r * u]);
  const cell = (x0, y0, [x1, y1], color, fill, start) => {
    const L = P.layer();
    L.box(x0 + 4, y0 + 4, u - 8, u - 8, { r: 6, color, fill, sw: 2.2, at: 0, dur: 0.01, texture: false });
    P.tick((lt) => {
      const k = ease.inOut(clamp((lt - start) / 0.6)), lift = Math.sin(Math.PI * k) * 40;
      L.wrap.style.transform = `translate(${lerp(0, x1 - x0, k).toFixed(1)}px, ${(lerp(0, y1 - y0, k) - lift).toFixed(1)}px)`;
    });
  };
  for (let i = 0; i < 9; i++) cell(A.x - 3 * u + (i % 3) * u, A.y + Math.floor(i / 3) * u, corner[i], 'yellow', 'orangeF', t1 - 0.2 + i * 0.14);
  const blueEnd = P.cw(2, '二十五');
  for (let i = 0; i < 16; i++) cell(R.x + (i % 4) * u, R.y + Math.floor(i / 4) * u, rest[i], 'blue', 'blueF', t2 - 0.4 + i * ((blueEnd - t2 - 0.2) / 16));
  P.text('9 + 16 = 25', { x: S.x + 2.5 * u, y: S.y + 5 * u + 30, w: 600, align: 'c', size: 60, weight: 700, color: 'ink', at: blueEnd, cps: 12 });
  P.text('5', { x: S.x + 5 * u + 30, y: S.y + 2.5 * u - 50, size: 80, weight: 700, color: 'yellow', at: t3 + 0.2, cps: 5 });
  P.underline(S.x + 5 * u + 22, S.y + 2.5 * u + 52, 60, { color: 'yellow', at: t3 + 0.6 });
  P.underline(S.x + 5 * u + 22, S.y + 2.5 * u + 66, 60, { color: 'yellow', at: t3 + 0.8 });
  P.cam([P.push(t2, S.x + 2.5 * u, S.y + 2.5 * u + 60, 1.15), P.back(t3 + 0.2)]);
});
