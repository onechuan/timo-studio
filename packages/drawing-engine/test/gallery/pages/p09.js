// gates.js — stageDots, gates3d, pkt
ENGINE.visual('p09', (P) => {
  P.title('gates.js · stageDots / gates3d / pkt');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const steps = [{ label: '收件', color: 'blue' }, { label: '分拣', color: 'purple' }, { label: '装车', color: 'green' }, { label: '送达', color: 'orange' }];
  P.stageDots(steps, 2, { at: t0, y: 240 });
  P.gates3d({ cx: 760, cy: 560, w: 300, h: 340, steps, at: (i) => t0 + i * 0.2, label: '包裹', pos: (lt) => (lt < t1 ? null : -0.6 + 4 * PV.K(lt, t1, 2.2)), pass: (i) => t1 + 0.6 + i * 0.5 });
  P.pkt('包裹', 160, (lt) => (lt < t2 ? null : { x: 1500, y: 480 + 120 * PV.K(lt, t2, 0.6) }));
});
