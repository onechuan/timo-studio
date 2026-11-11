// bookshelf.js — shelf
ENGINE.visual('p01', (P) => {
  P.title('bookshelf.js · shelf');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const books = Array.from({ length: 48 }, (_, i) => ['b' + i, 40 + ((i * 37) % 90), 800 + ((i * 1777) % 5200)]);
  P.shelf({ x: 260, y: 560, books, hero: 'b17', rows: 2, gapY: 260, at: t0, dim: (lt) => PV.K(lt, t1, 0.5), tilt: (lt) => ({ rx: 8, ry: -14 + 10 * PV.K(lt, t2, 0.8) }) });
});
