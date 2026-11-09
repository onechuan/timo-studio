ENGINE.visual('p01', (P) => {
  P.title('一片叶子');

  // leaf geometry: axis from base B to tip T
  const B = [600, 700], T = [1560, 380];
  const L = Math.hypot(T[0] - B[0], T[1] - B[1]);
  const d = [(T[0] - B[0]) / L, (T[1] - B[1]) / L];
  const n = [-d[1], d[0]]; // points down-right
  const W = 265;
  const wAt = (u) => W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.75);
  const at = (u, s) => {
    const w = wAt(u) * s;
    return [B[0] + d[0] * L * u + n[0] * w, B[1] + d[1] * L * u + n[1] * w];
  };
  const us = [0.04, 0.12, 0.22, 0.34, 0.46, 0.58, 0.7, 0.8, 0.88, 0.95];
  const upper = us.map((u) => at(u, -1));
  const lower = us.map((u) => at(u, 1)).reverse();
  const blade = PV.EG.smooth([B, ...upper, T, ...lower]);
  const mid = [0.95, 0.8, 0.6, 0.4, 0.2, 0.05].map((u) => at(u, 0));
  const lowerHalf = PV.EG.smooth([B, at(0.04, 0), ...us.slice(1).map((u) => at(u, 0.04)), T, ...lower]);

  const t0 = 0.1;
  P.engrave([
    { d: PV.EG.tube([[420, 840], [500, 785], [560, 740], [612, 698]], 9, 13), angle: 40, dark: 0.2 },
    { d: blade, angle: 66 },
    { d: lowerHalf, angle: 112, dark: 0.25 },
  ], { at: t0, dur: 3.6, seed: 11 });

  // veins: midrib then laterals curving forward to the margin
  P.cut(`M${B[0]},${B[1]} L${T[0]},${T[1]}`, { at: 1.5, dur: 0.9, w: 3.4 });
  let veins = '';
  [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.84].forEach((u) => {
    [-1, 1].forEach((s) => {
      const p0 = at(u, 0), p1 = at(u + 0.06, s * 0.55), p2 = at(Math.min(u + 0.12, 0.97), s * 0.9);
      veins += `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} `;
    });
  });
  P.cut(veins, { at: 2.1, dur: 1.6, w: 1.8, conc: 3 });

  P.fig(1530, 760, 1, '阔叶', { at: 3.0 });

  // c1: sunlight, water, air
  const tSun = P.cw(1, '阳光', -0.4);
  const rays = [[340, 222], [460, 196], [300, 350]];
  let rd = '';
  rays.forEach(([x, y]) => { rd += `M${x},${y} L${x + 470},${y + 350} `; });
  P.cut(rd, { at: tSun, dur: 1.0, w: 2.0, dotted: true, conc: 3 });
  P.label(295, 215, '阳光', { to: [340, 222], at: tSun + 0.3 });

  const tWater = P.cw(1, '水', -0.3);
  P.pointer(400, 870, 470, 810, { at: tWater, dur: 0.6, dotted: true });
  P.label(330, 790, '水', { to: [478, 800], at: tWater + 0.1 });

  const tAir = P.cw(1, '空气', -0.3);
  P.pointer(1700, 640, 1530, 585, { at: tAir, dur: 0.7, dotted: true });
  P.label(1620, 540, '空气', { to: [1478, 545], at: tAir + 0.1 });

  // c2: the cut line across the middle of the blade
  const tCut = P.cw(2, '剖开', -0.4);
  const cc = at(0.5, 0);
  const c1 = [cc[0] - n[0] * 320, cc[1] - n[1] * 320];
  const c2 = [cc[0] + n[0] * 320, cc[1] + n[1] * 320];
  P.cut(`M${c1[0].toFixed(1)},${c1[1].toFixed(1)} L${c2[0].toFixed(1)},${c2[1].toFixed(1)}`,
    { at: P.c(2, 0.2), dur: 1.0, w: 3.2, dotted: true });
  P.label(1280, 830, '剖面', { to: [c2[0] - n[0] * 30, c2[1] - n[1] * 30], at: tCut });

  P.cam([P.push(tCut, 980, 540, 1.06)]);
});
