// flowgraph.js — graph (+ run), packet, switcher, ckstack
ENGINE.visual('p07', (P) => {
  P.title('flowgraph.js · graph / switcher / packet / ckstack');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const G = P.graph({ at: t0, nodes: [{ id: 'START', term: true, x: 220, y: 360 }, { id: 'plan', x: 480, y: 360 }, { id: 'do', x: 760, y: 360, color: 'orange' }, { id: 'END', term: true, x: 760, y: 600 }],
    edges: [{ a: 'START', b: 'plan' }, { a: 'plan', b: 'do' }, { a: 'do', b: 'END', cond: true, label: '完成', lx: 860, ly: 470 }] });
  G.run([['START', t1], ['plan', t1 + 0.9], ['do', t1 + 1.8], ['END', t2 + 0.6]]);
  P.switcher(1000, 820, { at: t0, ax: 1300, ay: 720, bx: 1360, by: 820, k: (lt) => PV.K(lt, t2, 0.4) });
  const pk = P.packet(1000, 300, 160, 'state', { at: t0, sub: '状态' });
  P.move(pk, (lt) => ({ x: 120 * PV.K(lt, t1, 0.8) }));
  P.ckstack({ cx: 1560, cy: 520, w: 380, h: 200, n: 3, t: (i) => t1 + i * 0.4, label: (i) => 'v' + (i + 1), color: (i) => ['blue', 'green', 'orange'][i], glow: (i, lt) => i === 2 && lt > t2 });
});
