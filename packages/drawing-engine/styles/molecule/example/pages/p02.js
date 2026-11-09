ENGINE.visual('p02', (P) => {
  const M = P.micro({ mood: 'violet', scale: '2 nm' });
  P.title('DNA is a twisted zipper');

  // Hero: the double helix spanning the frame
  const dna = M.helix({ x: 960, y: 520, length: 1340, seq: 'ATGCGATACGTTAGCA', at: 0 });

  // Depth neighbours: loose bases drifting near and far
  const nearA = M.molecule('adenine', { x: 1560, y: 300, z: 220, r: 70, at: 0, spin: 0.2 });
  const farA = M.molecule('adenine', { x: 330, y: 760, z: -700, r: 90, at: 0, spin: 0.15 });

  // c1: zipper — light runs along the rungs like teeth closing, helix glows
  const tZip = P.cw(1, 'zipper');
  M.cam(P.c(1, 0.1), { to: dna, zoom: 1.3, dur: 2.2 });
  dna.glow(tZip);

  // c2: each tooth is a letter — four rungs named in turn
  M.label([620, 520, 0], 'A', { at: P.cw(2, 'A'), sub: 'adenine', side: 'up' });
  M.label([820, 520, 0], 'T', { at: P.cw(2, 'T'), sub: 'thymine', side: 'down' });
  M.label([1100, 520, 0], 'G', { at: P.cw(2, 'G'), sub: 'guanine', side: 'up' });
  M.label([1300, 520, 0], 'C', { at: P.cw(2, 'C'), sub: 'cytosine', side: 'down' });

  // c3: each letter fits only one partner — rack focus to the loose base, then back to the pairs
  M.focus(nearA, P.c(3, 0.2), 1.2);
  M.focus(dna, P.c(3, 2.0), 1.2);
});
