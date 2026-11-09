// tower.js — tower3d, flipcard, memcard
ENGINE.visual('p26', (P) => {
  P.title('tower.js · tower3d / flipcard / memcard');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.tower3d({ cx: 460, cy: 560, levels: [{ w: 200, color: 'orange' }, { w: 280, color: 'green' }, { w: 360, color: 'blue' }], at: (i) => t0 + i * 0.3, rot: (lt) => ({ rx: 60, rz: -30 + 10 * PV.K(lt, t2, 1) }) });
  P.flipcard(900, 300, 420, 140, ['问题', '为什么天是蓝的'], ['答案', '散射'], { at: t0, flip: t1, color: 'blue', backColor: 'orange' });
  P.memcard(1420, 300, 360, 260, 'todo.md', { at: t0, tag: '本周', color: 'green' });
});
