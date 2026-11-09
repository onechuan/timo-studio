ENGINE.visual('p03', (P) => {
  const EG = PV.EG;
  P.title('气孔：叶子的进气口');

  // ---- spongy mesophyll above, epidermis band with the stoma ----
  const blobs = [
    [240, 250, 60], [370, 310, 62], [250, 405, 52], [500, 245, 58], [520, 385, 62],
    [660, 300, 60], [780, 230, 52], [790, 395, 56], [930, 240, 56], [1080, 235, 54],
    [1130, 385, 58], [1250, 300, 62], [1390, 240, 58], [1400, 400, 58], [1530, 310, 62],
    [1660, 240, 54], [1650, 410, 50],
  ];
  const tissue = blobs.map(([x, y, r], i) => ({
    d: EG.blob(x, y, r, 11 + i, 0.18), tone: 'sphere', angle: (20 + i * 47) % 180,
  }));
  tissue.push({ d: EG.poly([[150, 470], [804, 470], [804, 552], [150, 552]]), angle: 90, tone: 0.35 });
  tissue.push({ d: EG.poly([[1116, 470], [1770, 470], [1770, 552], [1116, 552]]), angle: 80, tone: 0.35 });
  P.engrave(tissue, { at: 0.6, dur: 4.2, seed: 3 });

  // epidermal cell walls
  let walls = '';
  for (let x = 260; x < 780; x += 120) walls += `M${x} 472 L${x + 4} 550 `;
  for (let x = 1220; x < 1770; x += 120) walls += `M${x} 472 L${x - 4} 550 `;
  P.cut(walls, { at: 3.0, dur: 1.4, w: 2 });

  // ---- the pore (dark), behind the guard cells ----
  P.engrave([{ d: EG.ellipse(960, 512, 55, 72), style: 'dark' }], { at: 0.1, dur: 1.6 });

  // ---- guard cells (kidney-shaped in section) ----
  const L = [[890, 428], [925, 436], [948, 456], [952, 478], [944, 498], [940, 512], [944, 528],
    [952, 548], [946, 572], [922, 590], [888, 594], [855, 584], [834, 560], [826, 528],
    [826, 494], [834, 462], [856, 438]];
  const R = L.map(([x, y]) => [1920 - x, y]);
  const swell = P.cw(2, '鼓起来', -0.3);
  const tintAt = P.cw(2, '鼓起来', 0.4);
  const mv = (sgn, cx) => (lt) => {
    const k = PV.K(lt, swell, 2.2);
    return { dx: sgn * 22 * k, rot: sgn * 5 * k, s: 1 + 0.07 * k, cx, cy: 512 };
  };
  P.engrave([{ d: EG.smooth(L), tone: 'sphere', angle: 35 }], {
    at: 0.15, dur: 3.2, move: mv(-1, 890), tint: 'green', tintAt, from: [880, 500], seed: 7,
  });
  P.engrave([{ d: EG.smooth(R), tone: 'sphere', angle: 125 }], {
    at: 0.35, dur: 3.2, move: mv(1, 1030), tint: 'green', tintAt, from: [1040, 500], seed: 8,
  });

  // ---- labels ----
  P.label(1360, 720, '气孔', { to: [965, 592], at: P.cw(0, '气孔', -0.3), sub: 'stoma' });
  P.label(560, 650, '保卫细胞', { to: [850, 578], at: P.cw(1, '保卫细胞', -0.3) });
  P.label(1360, 645, '保卫细胞', { to: [1070, 578], at: P.cw(1, '保卫细胞', 0.3) });

  P.fig(320, 690, 1, '气孔横切', { at: 2.2 });
  P.scalebar(1580, 760, 160, '10 微米', { at: 3.4 });

  // ---- gas exchange through the opened pore ----
  const tCO2 = P.cw(3, '二氧化碳', -0.3);
  P.pointer(1060, 870, 900, 330, { dotted: true, at: tCO2, dur: 1.2, w: 2.6 });
  P.label(1280, 795, '二氧化碳', { to: [1036, 795], at: tCO2 + 0.6 });

  const tO2 = P.cw(4, '氧气', -0.3);
  P.pointer(1020, 330, 860, 870, { dotted: true, at: tO2, dur: 1.2, w: 2.6, color: 'blue' });
  P.label(640, 795, '氧气 / 水汽', { to: [883, 795], at: tO2 + 0.6 });

  // ---- camera: one push toward the pore as it opens ----
  P.cam([P.push(swell, 960, 520, 1.15), P.back(P.c(3, -0.4))]);
});
