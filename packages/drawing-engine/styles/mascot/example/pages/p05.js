ENGINE.visual('p05', (P) => {
  const c3 = P.c(3), c4 = P.c(4);
  const t500 = P.cw(3, '500');
  const t600 = P.cw(2, '600');

  P.mascot({
    place: 'left',
    acts: [
      [0.3, 'think'],
      [P.c(1, 0.4), 'shock'],
      [P.c(2, 0.2), 'calc'],
      [c3 + 0.2, 'sad'],
      [c4 + 1.4, 'sad'],
      [c4 + 2.2, 'sad'],
    ],
    say: [[c4 + 1.4, 'Ouch!'], [P.endT + 0.6, null]],
  });

  P.title('The {r:January} trap', { at: 0 });

  // the desk calendar: January → March
  P.calendar(880, 340, {
    at: 0.2,
    w: 280, h: 230, size: 64,
    color: 'red',
    top: 'Signed up',
    label: [[0, 'January'], [P.cw(1, 'March', -0.1), 'March']],
  });

  // the gym key card, then it goes away
  P.thing('card', 1300, 480, {
    size: 260, color: 'blue', label: 'Gym key card',
    at: 0.6, wobble: true, out: P.c(1, 1.6),
  });
  P.pill(880, 520, 'Stopped going', {
    color: 'redF', size: 40, at: P.c(1, 1.2), out: P.c(2, 0.1),
  });

  // the year's bill
  P.receipt(1330, 400, [
    ['$50 a month', '× 12'],
  ], {
    title: 'Gym membership', w: 520,
    total: ['Year', '$600', 'orange'],
    at: t600 - 1.2, gap: 0.5,
  });

  // the pouch holding the $600
  P.pouch(880, 860, {
    label: 'Paid', color: 'orange', coins: 6, prefix: '$', total: 600,
    at: P.c(2, 0.2), drop: t600 - 1.8, dur: 1.8,
  });

  // coins fly out: the wasted months
  for (let i = 0; i < 5; i++) {
    const tt = c3 + 0.6 + i * 0.35;
    P.coin(1150 + i * 120, 650 - (i % 2) * 30, {
      r: 36, label: '$', from: [880, 700], at: tt, dur: 0.7, out: tt + 1.2,
    });
  }

  // $500 wasted
  P.bignum(1330, 780, 500, {
    prefix: '$', color: 'red', size: 170, label: 'wasted',
    at: t500 - 0.8, dur: 0.8,
  });

  // verdict
  P.stamp(1640, 470, 'Skip', { color: 'red', at: c4 + 0.2, r: 90 });
});
