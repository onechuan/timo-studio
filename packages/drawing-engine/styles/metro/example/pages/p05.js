ENGINE.visual('p05', (P) => {
  P.title('先看症状，再选线路');

  const w1 = (s, d = 0) => P.cw(1, s, d);
  const w2 = (s, d = 0) => P.cw(2, s, d);

  // 整张网络：开场时快速重绘一遍（回顾），全部从「发烧」出发
  const green = P.route([
    { c: 2, r: 5, name: '发烧', at: 0.1, side: 's' },
    [5, 2],
    [11, 2, '药店'],
    [19, 2, '在家休息'],
  ], { color: 'green', name: '绿线 · 轻症休整', at: 0.1, speed: 1100 });

  const blue = P.route([
    [2, 5],
    [13, 5, '社区医院'],
    [19, 5, '复查康复'],
  ], { color: 'blue', name: '蓝线 · 不退就医', badge: '2', at: 0.5, speed: 1100 });

  const purple = P.route([
    [13, 5],
    [16, 8],
    [25, 8, '专科门诊'],
  ], { color: 'purple', name: '紫线 · 复杂转诊', badge: '3', at: 1.6, speed: 1100 });

  const red = P.route([
    [2, 5],
    [8, 11],
    [25, 11, '急诊'],
  ], { color: 'red', name: '红线 · 危险直达', badge: '4', at: 0.9, speed: 1100 });

  // 你在这里：落在起点站
  P.here(2, 5, { at: P.cw(0, '自己', -0.2), side: 's' });

  // 每条线的列车再跑一遍，标出症状
  P.train(green, { at: w1('绿线'), from: 0, to: '在家休息', dur: w2('休息') - w1('绿线'), label: '轻症', color: 'green', out: P.ce(2) + 0.3 });
  P.train(blue, { at: w1('蓝线'), from: 0, to: '社区医院', dur: w2('看病') - w1('蓝线'), label: '不退', color: 'blue', out: P.ce(2) + 0.3 });
  P.train(purple, { at: w1('紫线'), from: 0, to: '专科门诊', dur: w2('看病', 0.8) - w1('紫线'), label: '复杂', color: 'purple', out: P.ce(2) + 0.3 });
  P.train(red, { at: w1('红线'), from: 0, to: '急诊', dur: w2('危险') - w1('红线'), label: '危险', color: 'red', out: P.ce(2) + 0.3 });

  // 图例出现在右上角
  P.legend(null, { pos: 'tr', at: w1('红线', 0.3) });
});
