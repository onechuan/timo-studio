// cells.js — cells, win, place3d; PV.fmt / fmtK
ENGINE.visual('p03', (P) => {
  P.title('cells.js · win / cells / place3d');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.win({ x: 220, y: 260, cols: 16, rows: 8, cell: 34, gap: 6, title: '窗口', at: t0, n: (lt) => 128 * PV.K(lt, t1, 1.6), label: (lt) => PV.fmtK(128000 * PV.K(lt, t1, 1.6)) + ' / 128K' });
  const L = P.layer();
  L.box(1240, 360, 420, 260, { r: 20, fill: 'orangeF', color: 'orange', at: t0, dur: 0.4, texture: false });
  L.text(PV.fmt(185317), { x: 1450, y: 450, w: 400, align: 'c', size: 52, font: 'latin', weight: 700, color: 'orange', at: t0 + 0.2, mode: 'fade' });
  P.place3d(L, (lt) => ({ ry: -30 * PV.K(lt, t2, 0.8), z: -80 * PV.K(lt, t2, 0.8) }), [1450, 490]);
});
