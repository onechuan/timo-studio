ENGINE.visual('p04', (P) => {
  const n48 = P.cw(0, '48');
  const n60 = P.cw(1, '60');
  const n50 = P.cw(2, '50');
  const stampT = P.cw(3, 'even', -0.3);

  P.mascot({
    place: 'left',
    acts: [
      [0, 'think'],
      [P.c(1, 2.3), 'shock'],
      [P.c(2, -0.4), 'idle'],
      [P.endT - 0.6, 'cheer'],
    ],
    say: [[P.c(1, 2.3), 'Whoa, $60!'], [P.c(2, 0), null]],
  });

  P.title('Where it {o:breaks even}');

  // 4 drop-ins
  P.calc(720, 200, ['4 drop-ins × {o:$12}'], {
    at: 0, size: 70,
    result: { value: 48, prefix: '$', at: n48 - 0.8, color: 'green' },
  });
  P.pill(1130, 420, 'Under $50', { color: 'green', at: n48 + 0.6, tilt: -4, size: 50 });

  // 5 drop-ins
  P.calc(720, 520, ['5 drop-ins × {o:$12}'], {
    at: P.c(1, 0), size: 70,
    result: { value: 60, prefix: '$', at: n60 - 0.8, color: 'red' },
  });
  P.pill(1130, 760, 'Over $50', { color: 'red', at: n60 + 0.6, tilt: 4, size: 50 });

  // the membership pouch
  P.pouch(1590, 860, {
    size: 1.2,
    label: 'Membership', color: 'blue', coins: 5,
    at: P.c(2, 0), drop: n50 - 1.8, dur: 1.6,
    total: 50, prefix: '$',
  });

  // the drop-in price, on screen from the first frame
  P.pricetag(1480, 180, 'Drop-in', '$12', { at: 0, w: 260, h: 170, swing: -1, out: P.c(2, -0.2) });

  // verdict
  P.stamp(1400, 290, '5 visits', { color: 'green', r: 105, at: stampT });
});
