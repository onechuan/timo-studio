ENGINE.visual('p03', (P) => {
  P.ground('night', { hills: true, seed: 3 });
  P.title('窗花：把心愿剪进窗户');

  // Hero: the wedge is cut and unfolds into a window flower, later backlit
  const tFish = P.cw(1, '鱼');
  const tBird = P.cw(2, '喜鹊');
  const tLight = P.cw(3, '光');
  P.flower(960, 500, 290, {
    fold: 12, seed: 33, at: P.c(0, -0.2), cutDur: 1.2, dur: 1.1,
    glow: tLight, glowR: 1.2, project: [960, 840, 760, 90],
  });

  // Fish swims in from the left, tail sway
  P.animal('fish', 390, 530, 440, {
    at: tFish - 0.2, enter: 'paste', sway: 4,
    move: (lt) => {
      const k = PV.K(lt, tFish - 0.2, 1.3, 'out');
      return [(1 - k) * -520, Math.sin(lt * 3) * 6];
    },
  });
  P.banner('年年有余', 240, 700, { size: 46, at: P.cw(1, '年年有余') });

  // Magpie lands upper right, hops twice
  P.animal('magpie', 1540, 330, 420, {
    at: tBird, enter: 'drop',
    move: (lt) => {
      const u = lt - (tBird + 0.6);
      if (u < 0 || u > 1.2) return [0, 0];
      return [0, -Math.abs(Math.sin(u / 0.6 * Math.PI)) * 22];
    },
  });
  P.banner('喜上眉梢', 1390, 540, { size: 46, at: P.cw(2, '喜上眉梢') });

  // Light comes through: push toward the flower
  P.cam([P.push(tLight + 0.3, 960, 520, 1.12)]);
});
