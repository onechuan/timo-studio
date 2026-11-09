ENGINE.visual('p02', (P) => {
  P.title('叶片的分层');
  const R = PV.rng(21);
  const X0 = 400, X1 = 1500;

  // a living rounded cell outline through 12 jittered points
  const cell = (x, y, w, h, j) => {
    const q = [[0.15, 0], [0.5, 0], [0.85, 0], [1, 0.12], [1, 0.5], [1, 0.88],
      [0.85, 1], [0.5, 1], [0.15, 1], [0, 0.88], [0, 0.5], [0, 0.12]];
    return PV.EG.smooth(q.map(([a, b]) => [x + a * w + (R() - 0.5) * j, y + b * h + (R() - 0.5) * j]));
  };

  // ── upper epidermis ──
  const upper = [];
  const nU = 14, pU = (X1 - X0) / nU;
  for (let i = 0; i < nU; i++) {
    upper.push({ d: cell(X0 + i * pU + 2, 230, pU - 4, 48, 4), angle: i % 2 ? 78 : 100, tone: 0.25 });
  }
  P.cut(`M${X0} 224 C700 220 1100 226 ${X1} 223`, { at: 0.1, dur: 0.9, w: 2.6 });
  P.engrave(upper, { at: 0.2, dur: 1.9, seed: 3 });

  // ── palisade layer ──
  const pal = [];
  const nP = 19, pP = (X1 - X0) / nP;
  let chl = '';
  for (let i = 0; i < nP; i++) {
    const x = X0 + i * pP + 3, w = pP - 7, h = 200 + (R() - 0.5) * 18;
    pal.push({ d: cell(x, 288, w, h, 5), angle: i % 2 ? 12 : -18, tone: 'form' });
    for (let k = 0; k < 5; k++) {
      const cy = 318 + k * 38 + (R() - 0.5) * 8;
      const cx = x + w * (k % 2 ? 0.32 : 0.68);
      chl += PV.EG.ellipse(cx, cy, 8, 12, 0) + ' ';
    }
  }
  P.engrave(pal, { at: 0.8, dur: 3.4, seed: 5 });
  P.cut(chl, { at: P.c(2, 0.6), dur: 2.4, conc: 10, w: 1.6 });

  // ── spongy layer ──
  const sp = [];
  const rows = [548, 612, 672];
  rows.forEach((cy, r) => {
    for (let x = 450 + (r % 2) * 46; x < X1 - 30; x += 92) {
      if (r === 2 && x > 1040 && x < 1160) continue; // cavity above the pore
      const rr = 29 + R() * 8;
      sp.push({ d: PV.EG.blob(x + (R() - 0.5) * 14, cy + (R() - 0.5) * 10, rr, 11 + sp.length, 0.18),
        angle: sp.length % 2 ? 45 : -40, tone: 'sphere' });
    }
  });
  P.engrave(sp, { at: 2.0, dur: 3.6, seed: 9 });

  // ── lower epidermis with one pore ──
  const low = [];
  const segs = [[X0, 1058], [1142, X1]];
  segs.forEach(([a, b]) => {
    const n = Math.round((b - a) / 76), p = (b - a) / n;
    for (let i = 0; i < n; i++) low.push({ d: cell(a + i * p + 2, 708, p - 4, 44, 4), angle: i % 2 ? 95 : 70, tone: 0.25 });
  });
  low.push({ d: PV.EG.ellipse(1080, 730, 21, 25, 0), angle: 30, tone: 'sphere', dark: 0.25 });
  low.push({ d: PV.EG.ellipse(1120, 730, 21, 25, 0), angle: -30, tone: 'sphere', dark: 0.25 });
  P.engrave(low, { at: 3.2, dur: 2.6, seed: 13 });
  P.cut(`M${X0} 757 C700 760 1000 756 1058 758 M1142 758 C1300 760 1400 756 ${X1} 758`, { at: 4.6, dur: 0.9, w: 2.4 });

  // ── labels on the words ──
  P.label(360, 254, '上表皮', { to: [440, 254], sub: 'epidermis', at: P.cw(1, '表皮', -0.3) });
  P.label(360, 400, '栅栏组织', { to: [432, 400], sub: 'palisade', at: P.cw(2, '栅栏组织', -0.3) });
  P.label(1545, 600, '海绵组织', { to: [1478, 600], sub: 'spongy', at: P.cw(3, '海绵组织', -0.3) });
  P.label(1190, 836, '气孔', { to: [1100, 758], sub: 'stoma', at: P.cw(4, '小孔', -0.3) });

  // ── caption and scale ──
  P.fig(700, 800, 1, '叶片横切面', { at: P.c(3, 1.6) });
  P.scalebar(1350, 815, 200, '0.1 毫米', { at: P.c(3, 2.6) });

  // ── loupe onto the pore ──
  P.cam([P.push(P.cw(4, '小孔', -0.8), 1000, 690, 1.08), P.back(P.endT - 0.2)]);
});
