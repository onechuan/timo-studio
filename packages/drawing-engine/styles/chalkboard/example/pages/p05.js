/* p05 Close: a bamboo scroll traced on the left with 「勾三股四弦五」 written down it; a chalk arrow runs from the scroll to the triangle's hypotenuse on the right and circles the 5. */
ENGINE.visual('p05', (P) => {
  P.title('勾三股四弦五', { accent: 'yellow' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  // bamboo slips: six slats tied with two cords
  const sx = 260, sy = 230, sw = 64, sh = 500;
  for (let i = 0; i < 6; i++) P.box(sx + i * (sw + 6), sy, sw, sh, { r: 10, color: 'orange', fill: 'orangeF', sw: 2.4, at: t0 + 0.1 + i * 0.16, dur: 0.4, texture: false });
  P.line(sx - 16, sy + 36, sx + 6 * (sw + 6) + 10, sy + 36, { color: 'soft', sw: 2.2, at: t0 + 1.2, dur: 0.4 });
  P.line(sx - 16, sy + sh - 36, sx + 6 * (sw + 6) + 10, sy + sh - 36, { color: 'soft', sw: 2.2, at: t0 + 1.4, dur: 0.4 });
  P.text('周髀算经', { x: sx + 3 * (sw + 6), y: sy + sh + 18, w: 400, align: 'c', size: 44, color: 'soft', at: P.cw(0, '周髀算经'), cps: 8 });
  // the six characters are written down the middle slats, top to bottom, as they are spoken
  [...'勾三股四弦五'].forEach((ch, i) => P.text(ch, { x: sx + (i < 3 ? 3 : 2) * (sw + 6) + sw / 2 - 27, y: sy + 80 + (i % 3) * 120, size: 54, weight: 700, at: P.cw(1, '勾三股四弦五') + i * 0.22, cps: 6 }));
  const u = 80, R = { x: 1180, y: 700 }, A = { x: R.x, y: R.y - 3 * u }, B = { x: R.x + 4 * u, y: R.y };
  P.path(`M${A.x} ${A.y} L${R.x} ${R.y} L${B.x} ${B.y} Z`, { at: 0.2, dur: 0.01 });
  P.text('3', { x: R.x - 60, y: R.y - 1.5 * u - 44, size: 64, weight: 700, color: 'blue', at: 0.3, mode: 'fade' });
  P.text('4', { x: R.x + 2 * u - 16, y: R.y + 14, size: 64, weight: 700, color: 'blue', at: 0.4, mode: 'fade' });
  const fx = (A.x + B.x) / 2 + 60, fy = (A.y + B.y) / 2 - 60;
  P.text('5', { x: fx - 18, y: fy - 50, size: 80, weight: 700, color: 'yellow', at: t1 + 1.6, cps: 5 });
  P.arrow(sx + 6 * (sw + 6) + 30, sy + 200, fx - 50, fy - 50, { bend: -0.22, color: 'yellow', at: t2 + 0.1, dur: 0.8 });
  P.ring(fx, fy, 120, 120, { color: 'yellow', at: t2 + 1.1 });
  P.cam([P.push(t1, 700, 500, 1.1), P.back(t2)]);
});
