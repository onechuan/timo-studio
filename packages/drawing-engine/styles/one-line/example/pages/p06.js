ENGINE.visual('p06', (P) => {
  P.title('Close enough to see');

  // The previous page's walkers are still on the paper.
  const wA = P.held('walker', 820, 660, 420);
  const wB = P.held('walker', 1100, 660, 420, { flip: true });

  // The second walker steps back into the paper as the first rises into the faces.
  wB.hide(P.c(0, 0.6), 0.9);

  const faceDone = Math.min(P.cw(2, 'whole'), P.endT - 0.8);

  // Warmth swells in behind both faces, a beat before "clearly".
  P.spot(830, 470, 240, { color: 'red', at: Math.max(P.c(1), P.cw(1, 'clearly') - 1.0), rx: 260, ry: 220 });

  // The walker rises and becomes the two facing profiles, the vase-shaped gap between them;
  // the pen closes the last chin on "whole" and lifts away.
  P.morph(['walker', 820, 660, 420], ['faces', 720, 530, 900], {
    replaces: wA,
    at: P.c(0, 0.3),
    done: faceDone,
    mode: 'unwind',
  });

  // Gallery caption on the bare paper to the right.
  P.caption('Room to stay whole\nthe gap keeps both', 1250, 500, { size: 50, at: P.c(2, 0.2) });
});
