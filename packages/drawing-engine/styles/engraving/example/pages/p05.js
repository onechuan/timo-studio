ENGINE.visual('p05', (P) => {
  P.title('叶脉：送水与运糖');
  const EG = PV.EG;
  const cx = 720, cy = 500;

  const tW = P.cw(1, '水'), tS = P.cw(2, '糖'), tL = P.cw(3, '糖');

  // ---- Fig. 1: cross-section of a vein (vascular bundle) ----
  const parts = [];
  parts.push({ d: EG.ring(cx, cy, 250, 285), angle: 35, tone: 0.45 });          // bundle sheath
  parts.push({ d: EG.circle(cx, cy, 250), style: 'stipple', tone: 0.22 });       // ground tissue
  parts.push({ d: EG.ellipse(cx, cy + 22, 200, 14, 0), angle: 90, dark: 0.3 });  // cambium band

  // xylem: large vessels, upper half
  const xy = [[620, 362, 46], [720, 330, 52], [820, 362, 46], [570, 452, 38], [670, 444, 40], [770, 444, 40], [870, 452, 38]];
  xy.forEach(([x, y, r], i) => {
    parts.push({ d: EG.ring(x, y, r * 0.76, r), angle: [60, -30, 15, -60, 40, -15, 75][i], tone: 'sphere' });
    parts.push({ d: EG.circle(x, y, r * 0.76), style: 'line', tint: 'blueF', tintAt: tW + i * 0.12 });
  });

  // phloem: small sieve tubes, lower half
  let k = 0;
  [578, 612, 646, 680, 714].forEach((y, row) => {
    const off = row % 2 ? 18 : 0;
    for (let x = 560 + off; x <= 880; x += 36) {
      if (Math.hypot(x - cx, y - cy) > 215) continue;
      parts.push({ d: EG.ring(x, y, 9, 15), angle: k % 2 ? 20 : -40, tone: 0.5 });
      parts.push({ d: EG.circle(x, y, 9), style: 'line', tint: 'orangeF', tintAt: tS + (y - 578) * 0.004 });
      k++;
    }
  });
  P.engrave(parts, { at: 0.1, dur: 4.2, seed: 5 });

  P.label(1010, 250, '叶脉', { to: [905, 300], at: P.c(0, 1.0), sub: '横切' });
  P.label(440, 290, '木质部', { to: [588, 336], at: P.cw(1, '木质部', -0.3), sub: '运水' });
  P.label(440, 770, '韧皮部', { to: [612, 680], at: P.cw(2, '韧皮部', -0.3), sub: '运糖' });
  P.fig(cx, 815, 1, '叶脉横切', { at: P.c(1, 2.2) });
  P.scalebar(170, 830, 170, '0.1 毫米', { at: P.c(2, 2.5) });

  // ---- Fig. 2: the whole leaf, on the right ----
  const lx = 1480;
  const leaf = EG.smooth([
    [lx, 230], [lx + 40, 280], [lx + 90, 350], [lx + 135, 430], [lx + 160, 520], [lx + 160, 600],
    [lx + 140, 670], [lx + 100, 720], [lx + 50, 750], [lx, 765], [lx - 50, 750], [lx - 100, 720],
    [lx - 140, 670], [lx - 160, 600], [lx - 160, 520], [lx - 135, 430], [lx - 90, 350], [lx - 40, 280],
  ]);
  const t3 = P.c(3, 0);
  P.engrave([
    { d: EG.tube([[lx, 755], [lx + 2, 800], [lx + 6, 830]], 11, 8), angle: 0, tone: 0.5 },
    { d: leaf, angle: 25, tone: 'form' },
  ], { at: t3, dur: 2.2, tint: 'greenF', tintAt: tL, tintDur: 1.8, from: [lx, 520], seed: 11 });

  let veins = `M${lx},245 L${lx},760`;
  for (let y = 330; y <= 700; y += 70) {
    const hw = y < 520 ? 60 + (y - 300) * 0.35 : 140 - (y - 520) * 0.35;
    veins += ` M${lx},${y + 30} Q${lx + 40},${y + 18} ${lx + hw},${y - 30}`;
    veins += ` M${lx},${y + 30} Q${lx - 40},${y + 18} ${lx - hw},${y - 30}`;
  }
  P.cut(veins, { at: t3 + 1.6, dur: 1.4, w: 2.4, conc: 3 });

  P.pointer(lx - 170, 870, lx - 85, 785, { at: t3 + 2.4, color: 'blue', dotted: true });
  P.pointer(lx + 85, 785, lx + 170, 870, { at: t3 + 2.6, color: 'orange', dotted: true });
  P.fig(lx, 815 + 0, 2, '叶', { at: t3 + 2.0 });
});
