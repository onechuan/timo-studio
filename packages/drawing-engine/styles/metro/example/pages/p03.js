ENGINE.visual('p03', (P) => {
  P.title('蓝线：社区医院先看清楚');

  // zone: the community hospital, appears as the blue train reaches it
  P.zone(6.5, 1.5, 20.5, 10.5, { name: '社区医院', color: 'blue', at: Math.max(0.2, P.cw(0, '社区医院') - 0.05) });

  // green line (from page 2) passes the start interchange, already there
  const green = P.route([
    [2, 0], [2, 3], [2, 10],
  ], { color: 'green', name: '绿线 · 在家休整', at: 0, speed: 1600 });

  // blue line: interchange → community hospital → blood test → diagnosis → medicine
  const blue = P.route([
    [2, 3, '发烧换乘', 0.1],
    [8, 3, '社区医院', P.cw(0, '社区医院')],
    [13, 3, '血常规', P.cw(1, '血常规')],
    [16, 3],
    { c: 19, r: 6, name: '判断病因', sub: '病毒/细菌', at: P.cw(2, '细菌'), side: 'w' },
    [19, 9],
    [24, 9, '对症开药', P.cw(3, '开药')],
  ], { color: 'blue', name: '蓝线 · 社区医院', at: 0.1 });

  green.dim(P.c(0, 1.2));

  P.note(13, 3, '**抽血化验**', { at: P.cw(1, '抽血'), side: 'n' });

  // purple branch: referral to a specialist
  const purple = P.route([
    [19, 6],
    [22, 3],
    [25, 3, '转诊专科', P.cw(4, '专科')],
  ], { color: 'purple', name: '紫线 · 转诊专科', at: P.c(4, 0.1), bend: 'diag' });

});
