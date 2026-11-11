ENGINE.visual('p04', (P) => {
  P.title('横渡太平洋');

  // The plate: the whole Pacific, from the strait to the islands
  P.region('pacific', { at: 0, dur: 3 });

  // Open ocean flourish
  P.token('monster', [-140, -20], { at: 0.6 });
  P.compass(undefined, { at: 1.2, r: 80 });

  // Title piece with the turning year
  P.cartouche('麦哲伦船队', {
    at: 0.3,
    years: [[0.3, 1520], [P.cw(1, '1521', -0.2), 1521]],
  });

  // Start: the western mouth of the strait
  P.place([-74.5, -52.5], { at: 1.0, kind: 'port', label: '麦哲伦海峡', size: 30 });

  // The long crossing, slow over the empty sea
  const rAt = 1.3;
  const rDur = Math.max(3, P.c(1, 0.6) - rAt);
  P.route([[-74.5, -52.5], [-100, -25], [144.8, 13.4], [123.98, 10.3]], {
    at: rAt, dur: rDur, icon: 'ship', color: 'red', line: 'dashed',
  });


  // Arrival in the Philippines (1521) — lean in
  P.name('菲律宾', [134, 19], { at: P.cw(1, '菲律宾', -0.3), size: 36, color: 'red' });
  const [mx, my] = P.xy([123.98, 10.3]);
  P.cam([P.push(P.cw(1, '菲律宾', -0.1), mx, my, 1.3), P.back(P.c(3, 0.1))]);

  // Magellan falls at Mactan
  P.place([123.98, 10.3], {
    at: P.cw(2, '战斗', -0.3), kind: 'battle', label: '麦克坦', color: 'red', size: 32,
    side: 'b',
  });

  // Two ships go on, toward the Spice Islands
  P.route([[123.98, 10.3], [127.4, 0.7]], {
    at: P.c(3, 0.4), dur: Math.max(1.8, P.endT - P.c(3, 0.4) - 0.3),
    icon: 'ship', color: 'red', line: 'dashed',
  });

});
