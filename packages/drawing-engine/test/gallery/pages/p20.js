// receipt.js — receipt, zipper
ENGINE.visual('p20', (P) => {
  P.title('receipt.js · receipt / zipper');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const rows = [['咖啡', '¥ 18'], ['面包', '¥ 12'], ['牛奶', '¥ 8'], ['合计', '¥ 38']];
  P.receipt(200, 260, 520, { at: t0, rows, rowT: (i) => t0 + 0.6 + i * 0.6, winH: 420, title: '小票', total: (lt) => '¥ ' + (lt > t2 ? 38 : 18) });
  P.zipper({ x: 980, y: 300, cw: 300, gap: 90, at: t0, rows: [{ a: '你好', b: '你好', h: 70 }, { a: '今天', b: '今天', h: 70 }, { a: '晴', b: '雨', h: 70 }],
    head: (lt) => 230 * PV.K(lt, t1, 1.6), state: (i, lt) => (lt < t1 + i * 0.5 ? 'idle' : i < 2 ? 'ok' : 'bad') });
});
