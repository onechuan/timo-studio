// dialog.js — dlg, lock, plates3d
ENGINE.visual('p05', (P) => {
  P.title('dialog.js · dlg / lock / plates3d');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.dlg(160, 280, 620, 'rm -rf build/', { at: t0, press: t2, info: ['会删除整个构建目录'] });
  P.lock(920, 420, 120, { at: t0 + 0.3, open: t2 });
  P.plates3d({ cx: 1420, cy: 560, w: 520, h: 240, plates: [{ label: '粗筛', color: 'blue' }, { label: '中筛', color: 'green' }, { label: '细筛', color: 'orange' }], at: (i) => t1 + i * 0.3 });
});
