/* p04 The theorem: the 3, 4, 5 beside the triangle's sides are erased and replaced by a, b, c; on the right a² + b² = c² is written out and boxed in chalk. */
ENGINE.visual('p04', (P) => {
  P.title('换成字母', { accent: 'yellow' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const u = 100, R = { x: 380, y: 690 }, A = { x: R.x, y: R.y - 3 * u }, B = { x: R.x + 4 * u, y: R.y };
  P.path(`M${A.x} ${A.y} L${R.x} ${R.y} L${B.x} ${B.y} Z`, { at: 0, dur: 0.01 });
  P.path(`M${R.x} ${R.y - 30} H${R.x + 30} V${R.y}`, { at: 0, dur: 0.01, sw: 2.4, color: 'soft' });
  const pos = [[R.x - 60, R.y - 1.5 * u - 44], [R.x + 2 * u - 16, R.y + 14], [(A.x + B.x) / 2 + 40, (A.y + B.y) / 2 - 110]];
  ['3', '4', '5'].forEach((n, i) => P.text(n, { x: pos[i][0], y: pos[i][1], size: 64, weight: 700, color: 'soft', at: 0, mode: 'fade', dur: 0.01 }).hide(t0 + 0.6 + i * 0.15, 0.4));
  ['a', 'b', 'c'].forEach((n, i) => P.text(n, { x: pos[i][0], y: pos[i][1] - 6, size: 72, weight: 700, color: ['blue', 'blue', 'yellow'][i], at: P.cw(1, ['a', 'b', 'c'][i]), cps: 5 }));
  const F = { x: 1260, y: 470 };
  P.text('a² + b² = c²', { x: F.x, y: F.y - 70, w: 900, align: 'c', size: 112, font: 'hand', weight: 700, at: t2, cps: 7 });
  P.box(F.x - 380, F.y - 110, 760, 210, { r: 26, color: 'yellow', at: t2 + 1.9, dur: 0.9 });
  P.cam([P.push(t2, 1100, 500, 1.12), P.back(P.endT - 0.2)]);
});
