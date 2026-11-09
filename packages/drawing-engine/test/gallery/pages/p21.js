// scorecard.js — scoretubes, ruler, badge; PV.rise
ENGINE.visual('p21', (P) => {
  P.title('scorecard.js · scoretubes / ruler / badge');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const items = [{ label: '体力', color: 'red' }, { label: '速度', color: 'orange' }, { label: '技巧', color: 'blue' }, { label: '耐力', color: 'green' }];
  P.badge(260, 270, '小明', { at: t0, color: 'blue' });
  P.scoretubes(380, 340, items, { at: t0, levels: ['', '一般', '好', '很好'], h: 300, val: PV.rise([2, 1.5, 3, 2.4], (i) => t1 + i * 0.2) });
  P.ruler(1060, 420, 720, items, { at: t2 });
});
