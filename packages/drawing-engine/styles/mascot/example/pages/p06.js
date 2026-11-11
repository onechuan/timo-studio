ENGINE.visual('p06', (P) => {
  const r0 = P.c(0, 0.3), r2 = P.c(2, 0.3);

  P.mascot({
    place: 'right',
    acts: [[0, 'book'], [P.c(1, 1.6), 'nod'], [P.c(2, 1.6), 'book'], [P.c(3, 1.2), 'wave']],
    say: [[P.c(3, 1.3), 'Your call!'], [P.endT + 0.6, null]],
  });

  P.title('Count your {o:visits} first', { at: 0 });

  // left column: the month to count, and the threshold number
  P.calendar(320, 400, {
    top: 'Count for',
    label: [[0, '1 month'], [P.cw(0, 'month', 0.2), '30 days']],
    color: 'blue', w: 280, h: 260, size: 58, at: 0.2,
  });
  P.bignum(320, 760, 5, {
    at: P.cw(1, '5', -0.6), dur: 0.5, label: 'visits a month', unit: '+',
    color: 'orange', size: 170, point: false,
  });

  // the checklist receipt, one row per cue
  P.receipt(830, 540, [
    ['Count visits first', '1 month'],
    ['5+ a month', 'Membership', 'green'],
    ['Under 5', '$12 pass', 'orange'],
  ], {
    title: 'Your checklist', w: 640, at: r0 - 0.3, gap: (r2 - r0) / 2,
  });

  P.stamp(1040, 800, 'Worth it?', { color: 'green', r: 95, at: P.c(3, 0.3), rot: -12 });
});
