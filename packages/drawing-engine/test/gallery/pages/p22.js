// segments.js — strip
ENGINE.visual('p22', (P) => {
  P.title('segments.js · strip');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.strip(160, 460, 1600, 120, { at: t0, max: 100, segs: (lt) => [{ v: 20, color: 'blue', label: '睡觉' }, { v: 35, color: 'green', label: '工作' }, { v: 15 + 15 * PV.K(lt, t1, 1), color: 'orange', label: '学习' }, { v: 15, color: 'purple', label: '其他' }],
    hit: (lt) => (lt > t1 ? 55 : null), wave: (lt) => (lt > t2 ? { from: 55, to: 85 } : null) });
});
