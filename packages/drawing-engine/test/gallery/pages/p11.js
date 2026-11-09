// layers.js — netgraph, layers3d, fcard, flip
ENGINE.visual('p11', (P) => {
  P.title('layers.js · netgraph / layers3d / fcard / flip');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const nodes = [{ id: '水', x: 0.2, y: 0.3, born: 0 }, { id: '阳光', x: 0.7, y: 0.2, born: 0 }, { id: '叶子', x: 0.45, y: 0.6, born: 1 }, { id: '糖', x: 0.8, y: 0.75, born: 2 }];
  const edges = [{ a: '水', b: '叶子', born: 1 }, { a: '阳光', b: '叶子', born: 1 }, { a: '叶子', b: '糖', born: 2 }];
  P.netgraph({ x: 140, y: 260, w: 560, h: 420, nodes, edges, t: (k) => t0 + k * 0.8, size: 30, hl: (id, lt) => (id === '叶子' && lt > t2 ? 'green' : null) });
  P.layers3d({ cx: 1040, cy: 520, w: 380, h: 200, gap: 120, plates: [{ color: 'blue', at: t0 }, { color: 'green', at: t0 + 0.3 }, { color: 'orange', at: t0 + 0.6 }] });
  P.fcard(1340, 260, 440, 'notes.md', [{ text: '第一条' }, { text: '加一条', add: true, at: t1 }, { text: '划掉这条', strike: t2 }], { at: t0 });
  P.flip(1560, 760, 360, 140, { text: '正面', color: 'blue' }, { text: '背面', color: 'orange' }, { show: t0, at: t2 });
});
