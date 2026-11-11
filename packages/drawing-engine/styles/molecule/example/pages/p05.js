ENGINE.visual('p05', (P) => {
  const M = P.micro({ mood: 'violet', scale: '2 nm' });
  P.title('One becomes two');

  const tTwo = P.cw(0, 'two');
  const tOld = P.cw(1, 'old');
  const tNew = P.cw(1, 'new');

  // Neighbours at other depths: a stray nucleotide in front, another far behind
  const nearN = M.molecule('adenine', { x: 1650, y: 230, z: 260, r: 70, at: 0 });
  const farN = M.molecule('adenine', { x: 1600, y: 760, z: -750, r: 90, at: 0 });

  // The helix being unzipped: the fork runs to the right end as the last letters pair
  const dna = M.helix({ x: 960, y: 520, length: 1300, at: 0 });
  dna.unzip(0, { dur: Math.max(1.5, tTwo - 0.3), copy: true });
  M.label({ of: dna, part: 'fork' }, 'fork', { at: 0.6 });
  dna.hide(tTwo);

  // Two finished double helices drift apart, side by side
  const h1 = M.helix({ x: 960, y: 520, length: 1250, z: 40, at: tTwo - 0.25 });
  const h2 = M.helix({ x: 960, y: 520, length: 1250, z: -60, at: tTwo - 0.25 });
  h1.to(tTwo, { x: 960, y: 360, z: 40 }, 2.2);
  h2.to(tTwo, { x: 960, y: 690, z: -60 }, 2.2);
  M.label([1450, 790, 0], '1 becomes 2', { at: tTwo + 0.6 });

  // Each new helix: one old strand, one new strand glowing orange
  M.label([700, 300, 40], 'old strand', { at: tOld, side: 'up' });
  h1.glow(tNew);
  h2.glow(tNew + 0.5);
  M.label([1150, 420, 40], 'new strand', { at: tNew + 0.2 });

  // Pull back and hold on the two copies
  nearN.to(P.c(2, 0), { x: 1760, y: 210, z: 300 }, 3);
  farN.to(P.c(2, 0), { x: 1700, y: 800, z: -900 }, 3);
  M.cam(P.c(2, 0.2), { zoom: 0.7, to: [960, 525, 0], dur: 2.6 });
});
