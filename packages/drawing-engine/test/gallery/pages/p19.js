// ranking.js — rankList, tower; PV.orderPos, PV.proj2d
ENGINE.visual('p19', (P) => {
  P.title('ranking.js · rankList / tower');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const items = [{ id: 'a', label: '苹果' }, { id: 'b', label: '香蕉', color: 'orange' }, { id: 'c', label: '橙子' }, { id: 'd', label: '葡萄' }];
  const keys = [[0, ['a', 'b', 'c', 'd']], [t1, ['b', 'a', 'c', 'd']], [t2, ['b', 'd', 'a', 'c']]];
  P.rankList({ x: 280, y: 300, w: 560, items, show: 4, at: t0, cut: 2, pos: (id, lt) => PV.orderPos(keys, id, lt) });
  P.tower(1300, 300, 300, 420, { at: t0, label: '五层', color: 'purple' });
  const at = PV.proj2d({ a: [0, 0], b: [1, 1] }, { x: 1560, y: 320, w: 240, h: 240 });
  P.circle(...at('a'), 30, { fill: 'blue', color: 'blue', at: t1 }); P.circle(...at('b'), 30, { fill: 'red', color: 'red', at: t1 });
});
