ENGINE.visual('p05', (P) => {
  P.title('Room is ordinary life');

  // previous page's last drawing: two facing profiles
  const h = P.held('faces', 960, 520, 820);

  // the faces unwind into one long horizon across the paper
  const HORIZON = [[0, 500], [250, 502], [500, 499], [750, 501], [1000, 500]];
  const m = P.morph(['faces', 960, 520, 820], [HORIZON, 960, 860, 2600], {
    replaces: h,
    at: 0.3,
    dur: 1.0,
  });

  // open sky behind the peak (called before the drawing it sits behind)
  P.spot(850, 380, 170, { color: 'blue', at: P.c(2, 0) });

  // one stroke: the line climbs into a mountain, a walker steps out at its foot,
  // and later a second walker comes back toward the first
  P.lineStory([
    { s: 'mountain', x: 640, y: 520, size: 860, done: P.cw(1, 'friend') },
    { s: 'walker', x: 1080, y: 700, size: 400, done: P.cw(1, 'yours') },
  ], { at: P.c(1, 0) });
  // the second walker, mirrored, heading back toward the first
  P.oneLine('walker', 1580, 700, 400, { flip: true, done: P.cw(3, 'back') });

  P.caption('Something new to tell', 1180, 360, { size: 48, at: P.c(3, 0.2) });

  // "and then…": the eye follows the road to the right
  P.cam([P.pan(P.c(2, 0.3), 1100, 540)]);
});
