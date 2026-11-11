ENGINE.visual('p03', (P) => {
  const t3 = Math.max(1.6, P.cw(0, '25') - 0.8);
  const t4 = P.cw(1, '17') - 0.8;
  const tc = P.c(2, 0.2);

  P.mascot({
    acts: [
      [0.3, 'pointL'],
      [t4 + 1.0, 'cheer'],
      [tc + 1.0, 'point', [1480, 430]],
    ],
  });

  P.title('More visits, {o:cheaper} visits');

  P.barchart([
    { label: '2 visits', value: 25, color: 'red', at: 0.3 },
    { label: '4 visits', value: 12.5, color: 'red', at: 1.0 },
    { label: '8 visits', value: 6.25, color: 'orange', at: t3 },
    { label: '12 visits', value: 4.17, color: 'green', at: t4 },
  ], { x: 220, y: 760, w: 1080, h: 440, prefix: '$', decimals: 2 });

  P.burst(1165, 680, { at: t4 + 0.8, color: 'green' });

  P.thing('card', 1480, 430, { size: 220, color: 'green', at: tc, wobble: true });
  P.pill(1480, 590, 'Regulars win', { color: 'green', at: tc + 0.4, tilt: -4 });
});
