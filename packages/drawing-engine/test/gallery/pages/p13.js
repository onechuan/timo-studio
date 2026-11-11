// messages.js — msgcol, flip2, cellgrid
ENGINE.visual('p13', (P) => {
  P.title('messages.js · msgcol / flip2 / cellgrid');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const rows = [['sys', 520], ['user', 300], ['ai', 640], ['use', 200], ['res', 420]];
  P.msgcol({ x: 120, y: 280, n: rows.length, row: (i, lt) => (lt < t0 + i * 0.2 ? null : { role: rows[i][0], w: rows[i][1] * (i === 4 ? 1 - 0.6 * PV.K(lt, t2, 0.6) : 1), label: i === 2 ? '回答' : '' }) });
  const { F, Bk } = P.flip2(1500, 380, { flip: (lt) => PV.K(lt, t1, 0.8) });
  F.box(1360, 300, 280, 160, { r: 16, fill: 'blueF', color: 'blue', at: t0, dur: 0.3, texture: false });
  Bk.box(1360, 300, 280, 160, { r: 16, fill: 'greenF', color: 'green', at: t0, dur: 0.3, texture: false });
  P.cellgrid(1200, 560, 12, 6, 44, { at: t0, color: (i, lt) => (i < 72 * PV.K(lt, t1, 1.6) ? (i < 20 ? 'blue' : 'orange') : null) });
});
