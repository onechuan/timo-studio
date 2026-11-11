ENGINE.visual('p03', (P) => {
  P.title('谁跑得最快');
  P.sign('谁最快？', { x: 140, y: 210, size: 150, color: 'red', hollow: true, at: P.c(0, 0.05), buzz: 2 });
  const L = P.panel(140, 450, 1640, 390, { label: 'RESPONSE TIME // SECONDS', at: P.c(0, 0.6) });
  L.meter(190, 500, 1540, [{ label: '人工客服', value: 180 }, { label: '搜索引擎', value: 10 }, { label: 'AI 助手', value: 0.8 }], { at: P.c(1), stagger: 1.6, hi: 2, fmt: (v) => (v < 2 ? v.toFixed(1) : Math.round(v)) + 's', max: 180 });
  P.readout(1780, 230, { label: 'FASTER', to: 225, unit: 'x', align: 'r', color: 'green', at: P.c(3, 0.6) });
  P.flash(P.c(3, 0.3), { color: 'red' });
});
