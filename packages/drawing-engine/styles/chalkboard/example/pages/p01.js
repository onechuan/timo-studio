/* p01 Opening: chalk traces a 3-4 right triangle, the two legs labelled 3 and 4, a question mark beside the hypotenuse, circled. */
ENGINE.visual('p01', (P) => {
  P.title('斜边有多长？', { accent: 'yellow' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const u = 120, R = { x: 460, y: 780 }, A = { x: R.x, y: R.y - 3 * u }, B = { x: R.x + 4 * u, y: R.y };
  P.line(R.x, R.y, A.x, A.y, { at: t0 + 0.2, dur: 0.6 });
  P.line(R.x, R.y, B.x, B.y, { at: t0 + 0.8, dur: 0.7 });
  P.line(A.x, A.y, B.x, B.y, { at: t0 + 1.5, dur: 0.8 });
  P.path(`M${R.x} ${R.y - 30} H${R.x + 30} V${R.y}`, { at: t0 + 2.3, dur: 0.3, sw: 2.4, color: 'soft' });
  P.text('3', { x: R.x - 60, y: R.y - 1.5 * u - 44, size: 64, weight: 700, color: 'blue', at: P.cw(1, '三'), cps: 6 });
  P.text('4', { x: R.x + 2 * u - 16, y: R.y + 16, size: 64, weight: 700, color: 'blue', at: P.cw(1, '四'), cps: 6 });
  const mx = (A.x + B.x) / 2 + 0.8 * 120, my = (A.y + B.y) / 2 - 0.6 * 120;
  P.text('?', { x: mx - 20, y: my - 56, size: 96, weight: 700, color: 'yellow', at: t2 + 0.3, cps: 4 });
  P.ring(mx, my, 150, 150, { at: t2 + 0.8, color: 'yellow' });
  // the question, written on the right half of the board
  P.text('斜边 = ?', { x: 1420, y: 470, w: 600, align: 'c', size: 96, weight: 700, at: t2 + 0.2, cps: 8 });
  P.underline(1250, 610, 340, { color: 'yellow', at: t2 + 1.0 });
  P.cam([P.push(t1, 700, 620, 1.12), P.back(t2)]);
});
