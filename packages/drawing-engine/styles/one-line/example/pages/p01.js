ENGINE.visual('p01', (P) => {
  P.title('How close is too close?');

  // Two facing profiles as one continuous line, in a 1000 box.
  // g = half the gap between the two nose tips.
  const faces = (g) => {
    const c = 500;
    const L = (o, v, k) => (k ? [c - g - o, v, 1] : [c - g - o, v]);
    const R = (o, v, k) => (k ? [c + g + o, v, 1] : [c + g + o, v]);
    const left = [
      L(250, 90), L(150, 150), L(112, 240), L(92, 330), L(104, 372, 1),
      L(0, 470, 1), L(68, 502, 1), L(54, 540), L(74, 566, 1), L(58, 592),
      L(98, 640, 1), L(72, 690), L(148, 742, 1), L(168, 860),
    ];
    const right = [
      R(168, 860), R(148, 742, 1), R(72, 690), R(98, 640, 1), R(58, 592),
      R(74, 566, 1), R(54, 540), R(68, 502, 1), R(0, 470, 1), R(104, 372, 1),
      R(92, 330), R(112, 240), R(150, 150), R(250, 90),
    ];
    return [...left, [c - g * 0.5, 935], [c + g * 0.5, 935], ...right];
  };

  const X = 700, Y = 520, S = 900;
  const wide = faces(130);
  const near = faces(16);

  // Warmth behind the two faces (called first so it sits behind the line).
  P.spot(X + 70, Y - 90, 230, { color: 'red', at: P.cw(2, 'goal') - 0.9, dur: 1.1 });

  // c0: the pen draws one profile, loops under, and draws the second facing it.
  const a = P.oneLine(wide, X, Y, S, { done: P.cw(0, 'face'), dur: P.cw(0, 'face') - 0.2 });

  // c1: they lean in until the gap is a narrow sliver.
  const m = P.morph([wide, X, Y, S], [near, X, Y, S], {
    mode: 'melt', replaces: a, from: P.cw(0, 'face') + 0.05, done: P.ce(1), dur: 2.0,
  });

  // c3: look closer at the gap; the question lands beside it.
  const tQ = P.cw(3, 'closest');
  P.caption('Why need room?', 1040, 470, { size: 52, at: tQ });
  P.cam([P.push(P.cw(3, 'why'), X + 60, Y - 40, 1.15)]);
});
