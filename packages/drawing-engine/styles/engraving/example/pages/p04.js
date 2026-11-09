ENGINE.visual('p04', (P) => {
  P.title('叶绿体');
  const EG = PV.EG;

  // ── Fig. 1: a palisade cell, long column, crowded with chloroplasts ──
  const cell = EG.smooth([
    [420, 196], [510, 188], [600, 198], [636, 240], [642, 360], [640, 500],
    [644, 640], [638, 750], [604, 790], [510, 798], [416, 790], [384, 752],
    [378, 640], [382, 500], [378, 360], [384, 240],
  ]);
  const parts = [{ d: cell, style: 'stipple', angle: 0, tone: 0.25 }];
  // nucleus
  parts.push({ d: EG.ellipse(512, 500, 46, 58, 0), tone: 'sphere', angle: 120, dark: 0.2 });
  // chloroplasts along both walls and a few inside
  const cps = [];
  for (let k = 0; k < 10; k++) {
    const y = 250 + k * 56;
    cps.push([410, y + (k % 2) * 10, -8]);
    cps.push([612, y + 22 - (k % 2) * 8, 8]);
  }
  [[470, 300], [550, 360], [460, 640], [560, 690], [500, 760], [530, 240]].forEach(([x, y]) => cps.push([x, y, 30]));
  cps.forEach(([x, y, r], i) => parts.push({
    d: EG.ellipse(x, y, 17, 27, r), tone: 'sphere', angle: i % 2 ? 35 : 145,
  }));
  P.engrave(parts, { at: 0.1, dur: 3.6, seed: 4 });
  P.label(350, 300, '细胞壁', { to: [382, 300], at: 2.0, sub: 'paries' });
  P.fig(510, 812, 1, '栅栏细胞', { at: 2.6 });

  // ── Roundel: one chloroplast magnified, stacked membrane discs ──
  const RC = [1150, 520];
  const rparts = [];
  rparts.push({ d: EG.ellipse(RC[0], RC[1], 250, 150, 0), tone: 'sphere', angle: 60, spacing: 9 });
  rparts.push({ d: EG.ellipse(RC[0], RC[1], 232, 134, 0), style: 'stipple', tone: 0.3 });
  const grana = [[-150, 0], [-70, -55], [-60, 55], [20, -10], [100, -60], [110, 55], [180, 0]];
  grana.forEach(([gx, gy], g) => {
    for (let k = 0; k < 6; k++) {
      rparts.push({
        d: EG.ellipse(RC[0] + gx, RC[1] + gy - 30 + k * 12, 32, 7, 0),
        tone: 0.45, angle: k % 2 ? 80 : 100, spacing: 4,
      });
    }
  });
  const tRound = P.cw(1, '叶绿体', -0.6);
  const tSugar = P.cw(3, '糖');
  P.roundel(RC[0], RC[1], 300, rparts, {
    at: tRound, dur: 2.6, from: [612, 470, 30], mag: '×2000',
    tint: 'green', tintAt: tSugar, seed: 7,
  });
  // stroma lamellae linking the stacks
  const lam = grana.slice(0, -1).map(([gx, gy], i) => {
    const [hx, hy] = grana[i + 1];
    return `M${RC[0] + gx + 30},${RC[1] + gy} L${RC[0] + hx - 30},${RC[1] + hy}`;
  }).join(' ');
  P.cut(lam, { at: tRound + 3.0, dur: 1.2, w: 1.6 });
  P.label(1490, 560, '叶绿体', { to: [1398, 535], at: P.cw(1, '叶绿体', -0.3), sub: 'chloroplastus' });

  // ── Sunlight: dotted rays from the upper left into the membranes ──
  const tSun = P.cw(2, '阳光', -0.3);
  P.cut('M720,190 L1000,440 M790,180 L1060,400 M680,250 L960,500', {
    at: tSun, dur: 1.0, dotted: true, w: 2, conc: 3,
  });
  P.pointer(900, 330, 1020, 440, { at: tSun + 0.6, dur: 0.6 });
  P.label(760, 200, '阳光', { to: [720, 190], at: tSun + 0.3, align: 'l' });

  // ── Water split, sugar made ──
  P.label(1490, 700, '葡萄糖', { to: [1330, 612], at: tSugar + 0.2, sub: 'glucosum' });
  P.cam([P.push(P.c(3, 0.2), 1000, 600, 1.08), P.back(P.c(4, -0.3))]);

  // ── The key number ──
  P.inscribe('6', 1640, 200, { size: 170, at: P.c(4, 0), sub: '个二氧化碳 + 6个水' });

  // ── Oxygen leaves ──
  const tO2 = P.cw(5, '氧气', -0.4);
  P.pointer(1010, 625, 880, 775, { at: tO2 - 0.3, dur: 0.7, dotted: true, bend: 0.2 });
  P.label(800, 830, '氧气', { to: [880, 780], at: tO2 + 0.2 });
});
