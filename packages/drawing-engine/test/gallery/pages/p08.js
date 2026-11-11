// fsm.js — fsm (+ cursor), plot
ENGINE.visual('p08', (P) => {
  P.title('fsm.js · fsm / plot');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const M = P.fsm([{ id: 'a', x: 260, y: 420, label: '空闲' }, { id: 'b', x: 560, y: 420, label: '运行', color: 'orange' }, { id: 'c', x: 410, y: 680, label: '结束', color: 'green' }],
    [['a', 'b', { label: '开始' }], ['b', 'c', {}], ['c', 'a', { bend: 0.2 }]], { at: t0, h: 74, size: 32 });
  M.cursor(['a', 'b', 'c'], (lt) => (lt < t1 ? null : Math.min(2, (lt - t1) * 0.9)));
  P.plot({ x: 960, y: 320, w: 760, h: 420, xs: [0, 10], ys: [0, 100], pts: [[0, 5], [2, 18], [4, 30], [6, 52], [8, 70], [10, 92]], reach: (lt) => 10 * PV.K(lt, t1, 2.4), xTicks: [[0, '0'], [5, '5'], [10, '10']], yTicks: [[50, '50'], [100, '100']], at: t0 });
});
