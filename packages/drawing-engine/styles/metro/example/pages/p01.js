ENGINE.visual('p01', (P) => {
  P.title('发烧了，第一站去哪');

  const tOrigin = 0.15;
  const tYao = P.cw(1, '药店');
  const tShe = P.cw(1, '社区医院');
  const tZhuan = P.cw(1, '专科');
  const tJi = P.cw(1, '急诊');

  // 绿线：起点向右，直达药店
  const green = P.route([
    [3, 6, '发烧了', tOrigin],
    [24, 6, '药店', tYao],
  ], { color: 'green', name: '绿线 · 药店', at: tOrigin, side: 'w' });

  // 蓝线：45° 斜向右下，社区医院
  const blue = P.route([
    [3, 6],
    [15, 10, '社区医院', tShe],
  ], { color: 'blue', name: '蓝线 · 社区医院', bend: 'diag', at: Math.max(tOrigin + 0.3, tShe - 1.5) });

  // 紫线：从社区医院分叉，延伸到专科
  const purple = P.route([
    [15, 10],
    [25, 8, '专科', tZhuan],
  ], { color: 'purple', name: '紫线 · 专科', bend: 'diag', at: Math.max(tShe + 0.05, tZhuan - 1.0) });

  // 红线：直线向上冲出，急诊
  const red = P.route([
    [3, 6],
    [3, 1],
    [15, 1, '急诊', tJi],
  ], { color: 'red', name: '红线 · 急诊', at: Math.max(tOrigin + 0.5, tJi - 1.4) });

  // 画成一张地铁图：图例
  P.legend(undefined, { pos: 'tr', at: P.c(2, 0.3) });

  // 起点都是发烧
  P.here(3, 6, { at: P.cw(3, '发烧'), text: '起点', side: 's' });
  P.note(10, 6, '**四条线**各通一处', { at: P.cw(3, '四条线') });
});
