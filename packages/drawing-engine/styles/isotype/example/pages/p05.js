ENGINE.visual('p05', (P) => {
  P.title('撑一位老人的人', { kick: '中国 · 1980–2050年' });

  // 开头那位老人：左侧大剪影，翻页即在
  P.glyph('elder', 360, 520, 540, { color: 'red', at: 0 });
  P.caption(360, 830, '一位老人', { align: 'c', size: 36, at: P.c(0, 0.3) });

  // 他身后干活年纪的人：三排，逐排盖印
  const R = P.rows(620, 250, [
    { label: '1980年', n: 12, at: P.c(1, 0.1), land: P.cw(1, '12个'), value: '12' },
    { label: '2020年', n: 5, at: P.c(2, 0.2), land: P.cw(2, '5个'), value: '5' },
    { label: '2050年', n: 2, at: P.c(3, 0.3), land: P.cw(3, '2个'), value: '2' },
  ], {
    glyph: 'worker', color: 'ink', w: 860, labelW: 170,
    key: '1个干活年纪的人',
  });

  // 说到2050年时，前两排退后，最后一排领镜
  const tD = P.c(3, 0.1);
  if (R.rows[0] && R.rows[0].dim) R.rows[0].dim(tD);
  if (R.rows[1] && R.rows[1].dim) R.rows[1].dim(tD);

  // 推近最后一排，然后定格
  const b = R.box || { x: 720, y: 250, w: 1060, h: 560 };
  const lastY = b.y + b.h * 0.78;
  const tPush = Math.min(P.cw(3, '2个') + 0.4, P.endT - 0.6);
  P.cam([P.push(tPush, 1000, lastY, 1.15)]);
});
