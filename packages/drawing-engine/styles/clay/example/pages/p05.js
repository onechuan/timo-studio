ENGINE.visual('p05', (P) => {
  P.set('lilac', { light: 900 });
  P.title('那个哈欠说明你在意他', { accent: 'orange' });

  const c1 = P.c(1), c2 = P.c(2);
  const tL = P.cw(1, '留意');
  const lerp = (a, b, k) => a + (b - a) * k;
  const walkK = (lt) => PV.K(lt, c2 + 0.1, 1.0);

  // friend (blue) on the right, yawns first
  P.buddy((lt) => lerp(1380, 960, walkK(lt)), 870, {
    size: 430, body: 'blue', face: 'l', glasses: true, hat: 'cap', accent: 'yellow',
    pose: [[0, 'idle'], [P.c(0, 0.2), 'sleepy'], [P.c(0, 2.3), 'idle'], [tL + 1.3, 'wave'],
      [c2 + 0.1, 'walk'], [c2 + 1.1, 'sleepy']],
    at: 0,
  });

  // you (orange) on the left, catches the yawn, then hops
  P.buddy((lt) => lerp(520, 620, walkK(lt)), 870, {
    size: 430, body: 'orange', face: 'r', hat: 'beanie', accent: 'blue',
    pose: [[0, 'idle'], [P.c(0, 1.2), 'think'], [tL, 'sleepy'], [tL + 0.9, 'jump'],
      [tL + 1.5, 'cheer'], [c2 + 0.1, 'walk'], [c2 + 1.1, 'sleepy']],
    at: 0,
  });

  // the friend's yawn as a balloon
  P.plate(1180, 330, 280, 96, '哈——啊~', {
    color: 'paper', tail: [1330, 470], at: P.c(0, 0.4), out: c1 - 0.2,
  });
  P.fx('zzz', 1470, 430, { at: P.c(0, 0.8), out: c1 });

  // you catch it: a little question, then the hop lands with a puff + hearts
  P.fx('sweat', 600, 470, { at: tL - 0.1 });
  P.fx('puff', 520, 870, { at: tL + 1.35 });
  P.fx('hearts', 700, 430, { at: tL + 1.5 });
  P.plate(560, 340, 260, 90, '你也困啦？', {
    color: 'orangeF', tail: [560, 450], at: tL + 1.4, out: c2,
  });

  // the moon peeks in, squinting
  P.prop('moon', 1580, 290, {
    size: 210, float: true, face: true,
    mood: (lt) => (lt < c2 + 1 ? 'happy' : 'sleepy'), at: c2 - 0.3,
  });
  P.fx('zzz', 1680, 200, { at: c2 + 1.4 });

  // the signature: the clay words land
  P.letters('该{休息}了', 1440, 660, {
    size: 130, hi: 'yellow', align: 'center', at: P.cw(2, '休息', -0.3), stagger: 0.1, tilt: 0.05,
  });
  P.fx('crumbs', 1440, 620, { at: P.cw(2, '休息', 0.1) });
  P.fx('puff', 790, 870, { at: c2 + 1.15 });

  P.cam([
    P.push(c1, 950, 620, 1.15),
    P.back(c2),
  ]);
});
