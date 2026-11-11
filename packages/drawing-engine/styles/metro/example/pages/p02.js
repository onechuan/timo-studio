ENGINE.visual('p02', (P) => {
  P.title('绿线：普通感冒，先在家休整');

  // zone for home rest, present from the first frame
  P.zone(0, 1, 17, 3.5, { name: '在家休整', color: 'green', at: 0 });
  // hospital zone appears with its station
  P.zone(2, 8, 14, 10.5, { name: '去医院', color: 'blue', at: P.cw(4, '医院', -0.4) });

  const green = P.route([
    [1, 2, '发烧', 0.1],
    [7, 2, '休息', P.cw(1, '休息')],
    [13, 2, '多喝水', P.cw(1, '喝水')],
    [19, 2],
    { c: 23, r: 6, name: '药店', sub: '退烧药', at: P.cw(2, '药店'), via: 'diag' },
    [23, 9, '换乘', P.cw(3, '3天')],
  ], { color: 'green', name: '居家线', badge: '1', at: 0.1 });

  // the big number: 3 days, landing on the word
  P.stat(10, 4, {
    to: 3, unit: '天', cap: '烧还不退', color: 'green',
    at: P.cw(3, '3天') - 0.9, dur: 0.9, size: 170,
  });

  // blue branch leaves the interchange on "换乘"
  const blue = P.route([
    [23, 9],
    [6, 9, '社区医院', P.cw(4, '医院')],
  ], { color: 'blue', name: '就医线', badge: '2', at: P.cw(4, '换乘') });

  P.note(23, 9, '**换乘** 去医院', { at: P.cw(4, '换乘', 0.1), side: 'n' });

  // gentle push toward the interchange, then back

});
