ENGINE.visual('p01', (P) => {
  P.set('peach');
  P.title('哈欠为什么会传染', { accent: 'orange' });

  const c1 = P.c(1), c2 = P.c(2), c3 = P.c(3);
  const wHa = P.cw(2, '哈欠');

  // a sleepy moon hanging over the set
  P.prop('moon', 1060, 330, {
    size: 180, float: true, face: true, at: 0.1,
    mood: (lt) => (lt < P.c(0, 1.2) ? 'sleepy' : lt < c3 ? 'happy' : 'sleepy'),
  });

  // friend (blue, glasses, yellow cap) on the right, facing left
  P.buddy(1460, 870, {
    size: 440, body: 'blue', hat: 'cap', accent: 'yellow', glasses: true,
    face: 'l', at: 0,
    pose: [[0, 'idle'], [P.c(0, 0.9), 'cheer'], [P.c(0, 2.6), 'sleepy'], [c2, 'idle'], [c3, 'shrug']],
    mood: (lt) => (lt < P.c(0, 0.9) ? 'happy' : lt < P.c(0, 2.6) ? 'shock' : lt < c2 ? 'sleepy' : 'happy'),
  });
  P.fx('zzz', 1600, 420, { at: P.c(0, 1.0), out: c1 });

  // you (orange, blue beanie) on the left, facing right
  P.buddy(470, 870, {
    size: 440, body: 'orange', hat: 'beanie', accent: 'blue',
    face: 'r', at: 0.15,
    pose: [[0, 'bounce'], [c1 + 0.2, 'surprised'], [c1 + 1.5, 'cheer'], [c2 + 0.2, 'idle'], [c3, 'think']],
    mood: (lt) => (lt < c1 + 0.2 ? 'happy' : lt < c1 + 1.5 ? 'worried' : lt < c2 + 0.2 ? 'shock' : lt < c3 ? 'happy' : 'think'),
  });
  P.fx('exclaim', 600, 400, { at: c1 + 0.2, out: c1 + 1.4 });
  P.fx('question', 700, 430, { at: c3 + 0.2, out: P.endT + 1 });

  // the word itself drops onto the floor
  P.letters('哈欠', 960, 870, {
    size: 210, align: 'center', colors: ['orange', 'blue'], at: wHa - 0.15, stagger: 0.18, tilt: 0.05,
  });
  P.fx('puff', 960, 860, { at: wHa + 0.2 });

  // the question
  P.plate(430, 260, 340, 104, '为什么？', {
    color: 'paper', at: c3 + 0.1, tail: [460, 390], tilt: -0.04,
  });

  // camera: hold wide, push onto you as you catch the yawn, back out for the word
  P.cam([
    { at: c1 + 0.8, x: 820, y: 600, s: 1.18, dur: 0.4, ease: 'out' },
    { at: c2 - 0.1, x: 960, y: 540, s: 1, dur: 0.4, ease: 'out' },
  ]);
});
