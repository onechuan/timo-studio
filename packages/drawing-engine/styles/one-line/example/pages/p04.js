ENGINE.visual('p04', (P) => {
  P.title('The gap itself is a shape');

  const FX = 820, FY = 540, FS = 920;

  // the previous page's single huge profile, already on the paper
  const h = P.held('profile', 760, 540, 1300);

  // the spot sits behind: the vase-shaped gap between the faces glows
  const tVase = P.cw(2, 'vase');
  P.spot(FX, FY + 20, 170, { ry: 270, color: 'yellow', at: tVase - 1.1, dur: 1.1 });

  // the one profile unwinds and redraws as two facing profiles with a gap
  P.morph(['profile', 760, 540, 1300], ['faces', FX, FY, FS], {
    replaces: h,
    at: P.c(0, 0.3),
    done: P.cw(1, 'Rubin'),
  });

  // gallery label beside the drawing, on bare paper
  P.caption('Rubin, 1915\nfaces, or a vase', 1360, 470, {
    size: 50,
    at: P.cw(1, 'Rubin', 0.3),
  });

  // look closer at the gap, then take in the whole picture
  P.cam([
    P.push(tVase, FX, FY, 1.15),
    P.back(P.cw(3, 'holds')),
  ]);
});
