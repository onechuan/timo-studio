ENGINE.visual('p01', (P) => {
  P.title('谁撑着一位老人', { kick: '中国 · 1980—2050年' });

  // 主角：一位65岁以上的老人，开场即在
  P.glyph('elder', 340, 530, 560, { color: 'red', at: 0.1 });
  P.caption(340, 830, '65岁以上', { align: 'c', size: 36, color: 'red', at: P.c(0, 0.6) });

  // 他身后一排干活年纪的人：12个，第12个落在"12个"上
  const land = P.cw(1, '12个');
  const t0 = Math.max(P.c(1, 0.2), land - 2.1);
  const A = P.array(null, null, {
    n: 12, glyph: 'worker', color: 'ink', cols: 6,
    area: { x: 720, y: 270, w: 800, h: 600 },
    at: t0, land, key: '1人',
  });

  // 行标签与数值：1980年 · 12 → 2050年？ · ？
  const t3 = P.cw(2, '2050年');
  P.follow((lt) => ({
    text: lt < t3 ? '1980年' : '2050年？',
    x: 740, y: 470,
    opacity: Math.min(1, Math.max(0, (lt - t0) / 0.3)),
  }), { size: 44, color: 'ink' });
  P.follow((lt) => ({
    text: lt < t3 ? '12' : '？',
    x: 1590, y: 460,
    opacity: Math.min(1, Math.max(0, (lt - land) / 0.25)),
  }), { size: 64, color: 'ink', w: 140 });

  // 2050年：整排变灰，末尾的人淡出，空出位置
  A.recolor(t3, 0, 12, 'muted', { stagger: 0.05, dur: 0.3 });
  A.dim(t3 + 0.9, { except: [0, 6], op: 0.08 });
});
