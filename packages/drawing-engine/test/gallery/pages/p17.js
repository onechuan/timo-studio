// pointcloud.js — space3d, chunkText, lanes
ENGINE.visual('p17', (P) => {
  P.title('pointcloud.js · space3d / chunkText / lanes');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const pts = Array.from({ length: 12 }, (_, i) => ({ p: [Math.cos(i * 1.7) * 0.8, Math.sin(i * 2.3) * 0.6, Math.cos(i * 0.9) * 0.7], color: ['blue', 'orange', 'green'][i % 3], label: i % 4 ? '' : '点' + i }));
  P.space3d({ cx: 380, cy: 520, R: 220, pts, at: (i) => t0 + i * 0.05, box: t0, rot: (lt) => ({ ay: lt * 0.3, ax: 0.3 }) });
  const text = '先切成小块，再按意思排好。每一块都能单独找到。';
  P.chunkText(760, 280, 520, { text, ends: [...text].map((_, i) => i + 1), size: 34, at: t0, cuts: (lt) => (lt < t1 ? null : { at: [6, 12, 19], k: 1 }) });
  P.lanes({ x0: 860, dx: 300, y0: 640, y1: 820, w: 240, h: 110, at: (i) => t1 + i * 0.25, link: [2, 3],
    stations: [{ label: '读入', icon: 'books', color: 'blue' }, { label: '切块', color: 'orange' }, { label: '存好', color: 'green' }, { label: '提问', icon: 'chat', color: 'purple', lane: 1 }, { label: '回答', color: 'blue', lane: 1 }] });
});
