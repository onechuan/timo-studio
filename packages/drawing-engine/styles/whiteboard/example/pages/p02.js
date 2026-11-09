/* p02 One tomato: the red marker traces a tomato and the green adds leaves, a sector sweeps from the top with 25 in the middle; an arrow links to 「写报告」 (write the report), circled, and the other items are crossed out. */
ENGINE.visual('p02', (P) => {
  P.title('二十五分钟，一件事', { accent: 'red' });
  const { clamp, ease } = PV;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const T = { x: 620, y: 570, r: 220 };
  P.circle(T.x, T.y, T.r * 2, { color: 'red', fill: 'redF', at: t0 + 0.2, dur: 0.9 });
  P.path(`M${T.x} ${T.y - T.r + 6} C${T.x - 30} ${T.y - T.r - 50} ${T.x - 90} ${T.y - T.r - 30} ${T.x - 110} ${T.y - T.r - 20} M${T.x} ${T.y - T.r + 6} C${T.x + 30} ${T.y - T.r - 50} ${T.x + 90} ${T.y - T.r - 30} ${T.x + 110} ${T.y - T.r - 20} M${T.x} ${T.y - T.r + 6} V${T.y - T.r - 50}`, { color: 'green', at: t0 + 1.0, dur: 0.6, sw: 4 });
  // the timer wedge sweeps clockwise from the top as the 25 minutes start running
  const sweepAt = P.cw(1, '二十五分钟');
  P.liveRough((lt, R) => {
    const k = 0.34 * ease.out(clamp((lt - sweepAt) / 3.2));
    if (k < 0.01) return null;
    const a = -Math.PI / 2 + k * Math.PI * 2, r = T.r - 26;
    return [R.path(`M${T.x} ${T.y} L${T.x} ${T.y - r} A${r} ${r} 0 ${k > 0.5 ? 1 : 0} 1 ${(T.x + Math.cos(a) * r).toFixed(1)} ${(T.y + Math.sin(a) * r).toFixed(1)} Z`, { color: 'red', fill: 'red', fillStyle: 'hachure', gap: 16, fw: 2.4, sw: 2.6 })];
  });
  P.text('25', { x: T.x, y: T.y - 100, w: 300, align: 'c', size: 150, weight: 700, at: sweepAt, cps: 4 });
  P.text('分钟', { x: T.x, y: T.y + 120, w: 300, align: 'c', size: 52, at: sweepAt + 0.5, cps: 8 });
  // one item on the list
  P.box(1180, 300, 500, 420, { r: 14, at: t0 + 0.4, dur: 0.7 });
  const items = ['写报告', '回邮件', '改方案'];
  items.forEach((s, i) => P.text(s, { x: 1240, y: 350 + i * 120, size: 54, at: t0 + 0.8 + i * 0.3, cps: 12 }));
  P.arrow(T.x + T.r + 20, T.y - 120, 1220, 390, { bend: -0.15, at: t2, dur: 0.5, color: 'blue', sw: 3.6 });
  P.ring(1325, 390, 260, 100, { at: t2 + 0.5, color: 'blue' });
  P.line(1230, 510, 1420, 506, { color: 'muted', at: t2 + 1.0, dur: 0.3 });
  P.line(1230, 630, 1420, 626, { color: 'muted', at: t2 + 1.3, dur: 0.3 });
  P.cam([P.push(t1, T.x + 120, T.y - 40, 1.12), P.back(t2)]);
});
