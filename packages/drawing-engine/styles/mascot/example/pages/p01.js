ENGINE.visual('p01', (P) => {
  // Host: the cat, standing on the left for the opening page
  P.mascot({
    who: 'cat',
    place: 'left',
    acts: [
      [0, 'shock'],
      [P.c(1, 0.6), 'point', [1560, 360]],
      [P.c(2, 0.2), 'think'],
      [P.c(3, 0.7), 'point', [1245, 560]],
      [P.endT - 0.6, 'think'],
    ],
  });

  P.title('{o:$50} a month or {o:$12} a visit?', { at: 0 });

  // Beat 1: the gym key card and its $50
  P.thing('card', 930, 600, { size: 280, color: 'blue', at: 0.2, in: 'drop' });
  P.bignum(930, 330, 50, { prefix: '$', at: P.cw(0, '50') - 0.6, size: 150 });
  P.pill(930, 800, 'a month', { color: 'yellow', at: P.cw(0, 'month', -0.1) });

  // Beat 2: the drop-in ticket with a swaying $12 tag
  P.pricetag(1560, 200, 'drop-in', '$12', { at: P.c(1, 0.1), w: 280, h: 190, color: 'yellowF' });
  P.thing('doc', 1560, 620, { size: 240, color: 'greenF', at: P.c(1, 0.4), in: 'drop', wobble: true });
  P.pill(1560, 800, 'a visit', { color: 'yellow', at: P.cw(1, 'visit', -0.1) });

  // Beat 4: the calendar with a question mark between them
  P.calendar(1245, 560, {
    top: 'Visits',
    label: [[0, '?']],
    color: 'purple',
    w: 220, h: 220, size: 110,
    at: P.c(3, 0.2),
  });
  P.pill(1245, 800, 'How often?', { color: 'purpleF', at: P.cw(3, 'often', -0.2) });
});
