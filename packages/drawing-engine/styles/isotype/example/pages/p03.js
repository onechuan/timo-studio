ENGINE.visual('p03', (P) => {
  P.title('2020年：孩子少了，老人多了', { kick: '每100个中国人 · 1980—2020' });

  // the 1980 block of 100, back on screen at once
  const A = P.array(null, null, {
    area: { x: 140, y: 200, w: 1180, h: 680 },
    cols: 20,
    groups: [
      { n: 34, color: 'orange' },
      { n: 61, color: 'ink' },
      { n: 5, color: 'red' },
    ],
    key: '1人',
    at: 0,
    land: 0.7,
  });

  // year ticker: holds on 1980, runs to 2020 as the voice says it
  const tRun0 = Math.max(1.0, P.cw(0, '40年', -0.6));
  const tRun1 = P.cw(1, '2020年', 0.3);
  P.year(1560, 230, {
    keys: [[tRun0, 1980], [tRun1, 2020]],
    from: 1980, to: 2050, w: 380, size: 150, at: 0,
  });

  // children: 16 of 34 fade back to black, landing on "18个"
  const tKid = P.cw(1, '18个', 0.2);
  const kidStag = 0.09;
  A.recolor(tKid - 16 * kidStag, 18, 34, 'ink', { stagger: kidStag });
  P.caption(1400, 600, '孩子 18', { size: 48, color: 'orange', at: tKid });

  // elders: 9 black figures turn red, landing on "14个"
  const tOld = P.cw(2, '14个', 0.2);
  const oldStag = 0.14;
  A.recolor(tOld - 9 * oldStag, 86, 95, 'red', { stagger: oldStag });
  P.caption(1400, 700, '老人 14', { size: 48, color: 'red', at: tOld });
});
