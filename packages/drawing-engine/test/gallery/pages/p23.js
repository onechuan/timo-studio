// sequence.js — seq, jsonPanel, fold3d, stack3d; PV.hlJson
ENGINE.visual('p23', (P) => {
  P.title('sequence.js · seq / jsonPanel / fold3d / stack3d');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const S = P.seq({ xl: 220, xr: 700, y0: 330, y1: 820, at: t0, left: { label: '顾客' }, right: { label: '店员', color: 'green' } });
  S.send(420, 'r', t0 + 0.6, '要一杯');
  S.send(560, 'l', t1, '好的', { w: 200 });
  P.jsonPanel(820, 280, 460, 260, [{ t: t1, title: '订单', lines: ['{', '  "drink": "茶",', '  "hot": true', '}'] }], { at: t0 });
  P.fold3d([{ x: 840, y: 640, w: 200, h: 160, name: 'menu', color: 'blue' }, { x: 1070, y: 640, w: 200, h: 160, name: 'cart', color: 'orange' }], { at: t0, fold: (i, lt) => PV.K(lt, t2 + i * 0.2, 0.6) });
  P.stack3d({ cx: 1580, cy: 560, w: 340, h: 200, gap: 70, layers: [{ label: '底层', at: t0 }, { label: '中层', at: t0 + 0.3 }, { label: '顶层', at: t0 + 0.6 }], color: (i, lt) => (lt > t2 && i === 2 ? 'orange' : 'blue') });
});
