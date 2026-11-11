ENGINE.visual('p02', (P) => {
  const c1 = P.c(1), c2 = P.c(2), c3 = P.c(3);

  P.mascot({
    acts: [
      [c1 + 0.3, 'point', [1000, 560]],
      [c3 + 0.4, 'shrug'],
      [P.endT - 0.6, 'nod'],
    ],
  });

  P.title('Divide the fee by your {o:visits}', { at: 0 });

  // Beat 1: the $50 pouch on the floor line
  P.pouch(400, 840, {
    label: 'Monthly fee', color: 'orange', coins: 5,
    at: 0.1, drop: 0.5, dur: 1.3, total: 50, prefix: '$',
  });

  // Beat 2: two coins split out, $25 each
  const two = [850, 1150];
  two.forEach((x, k) => {
    P.coin(x, 560, { r: 75, label: '$', from: [400, 640], at: c1 + 0.2 + k * 0.3, dur: 0.7, out: c2 });
    P.pill(x, 420, '$25', { color: 'yellow', size: 52, at: c1 + 0.6 + k * 0.2, out: c2 });
  });
  P.headline('2 visits · {o:$25} each', 1000, 760, { size: 64, at: c1 + 0.9, out: c2 });

  // Beat 3: four smaller coins, $12.50 counts down
  const four = [760, 920, 1080, 1240];
  four.forEach((x, k) => {
    P.coin(x, 580, { r: 52, label: '$', from: [400, 640], at: c2 + 0.15 + k * 0.2, dur: 0.6 });
  });
  P.bignum(1000, 380, 12.5, {
    from: 25, decimals: 2, prefix: '$', size: 140, color: 'orange',
    at: P.cw(2, '50', -0.9), dur: 0.9,
  });
  P.headline('4 visits · {o:$12.50} each', 1000, 760, { size: 64, at: c2 + 0.8 });

  // Beat 4: the drop-in ticket slides in, almost a tie
  P.pricetag(1450, 200, 'Drop-in pass', '$12', { color: 'blueF', w: 270, h: 190, at: c3 + 0.1 });
  P.pill(1490, 520, 'Almost a tie', { color: 'greenF', size: 44, at: c3 + 1.0, tilt: -4 });
});
