ENGINE.visual('p04', (P) => {
  P.title('2050年：老人约30个', { kick: '每100个中国人 · 联合国预测' });

  // 100人方阵：前30格是老人剪影（14红 + 16灰），其余70人灰色
  const A = P.array(null, null, {
    area: { x: 140, y: 200, w: 1100, h: 640 },
    cols: 20,
    groups: [
      { n: 14, color: 'red', glyph: 'elder' },
      { n: 16, color: 'muted', glyph: 'elder' },
      { n: 70, color: 'muted', glyph: 'man' },
    ],
    key: '1人',
    at: 0,
    dur: 0.5,
  });

  // 16个灰色老人一个接一个染红，最后一个落在“30个”上
  const t0 = P.c(1, 0.3);
  let t1 = P.cw(1, '30个');
  if (!(t1 > t0 + 1)) t1 = P.c(1, 2.2);
  const st = (t1 - t0) / 16;
  A.recolor(t0, 14, 30, 'red', { stagger: st, dur: 0.3 });

  // 年份：2020 → 2050，与染色同步
  const yx = 1500;
  P.year(yx, 230, {
    keys: [[0, 2020], [t0, 2020], [t1 + 0.3, 2050]],
    from: 2020, to: 2050, w: 440, size: 128,
  });

  // 老人计数，跟着染色一起数
  P.caption(yx, 470, '老人', { align: 'c', color: 'red', at: 0, size: 36 });
  P.follow((lt) => {
    const k = lt < t0 ? 0 : Math.min(16, Math.floor((lt - t0) / st + 1));
    return { text: String(14 + k), x: yx, y: 520, opacity: 1 };
  }, { size: 96, color: 'red', align: 'c', font: 'latin', weight: 700 });

  // 只剩红色30人亮着，镜头推近红色区
  const t2 = P.c(2, 0.1);
  A.dim(t2, { except: [0, 30] });
  let t3 = P.cw(2, '3个');
  if (!(t3 > t2)) t3 = P.c(2, 1.2);
  P.caption(yx, 670, '每10人近3个', { align: 'c', size: 40, at: t3 - 0.2 });

});
