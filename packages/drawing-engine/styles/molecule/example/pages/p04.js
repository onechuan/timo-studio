ENGINE.visual('p04', (P) => {
  const M = P.micro({ mood: 'violet', scale: '2 nm' });
  P.title('A pairs with T, G with C');

  // ---- hand-built bases (Å, planar). Pyrimidines face right, purines face left.
  // Thymine: 0 N1,1 C2,2 N3,3 C4,4 C5,5 C6,6 O(C2),7 O(C4),8 CH3,9 H(N3),10 H(N1),11 H(C6)
  const thymine = { atoms: [
    ['N', 0, 1.4, 0], ['C', 1.21, 0.7, 0], ['N', 1.21, -0.7, 0], ['C', 0, -1.4, 0],
    ['C', -1.21, -0.7, 0], ['C', -1.21, 0.7, 0], ['O', 2.4, 1.4, 0], ['O', 0, -2.62, 0],
    ['C', -2.45, -1.4, 0], ['H', 2.15, -1.2, 0], ['H', 0, 2.4, 0], ['H', -2.15, 1.2, 0],
  ] };
  // Cytosine: 0 N1,1 C2,2 N3,3 C4,4 C5,5 C6,6 O(C2),7 N4,8 H(N4),9 H(N4),10 H(N1),11 H(C5),12 H(C6)
  const cytosine = { atoms: [
    ['N', 0, 1.4, 0], ['C', 1.21, 0.7, 0], ['N', 1.21, -0.7, 0], ['C', 0, -1.4, 0],
    ['C', -1.21, -0.7, 0], ['C', -1.21, 0.7, 0], ['O', 2.4, 1.4, 0], ['N', 0, -2.75, 0],
    ['H', 0.9, -3.3, 0], ['H', -0.9, -3.3, 0], ['H', 0, 2.4, 0], ['H', -2.15, -1.2, 0], ['H', -2.15, 1.2, 0],
  ] };
  // Purine skeleton mirrored so N1 / C6 face left.
  // Adenine: 0 N1,1 C2,2 N3,3 C4,4 C5,5 C6,6 N6,7 N7,8 C8,9 N9,10 H(N6),11 H(N6),12 H(C2),13 H(C8),14 H(N9)
  const adenine = { atoms: [
    ['N', -1.21, 0.7, 0], ['C', -1.21, -0.7, 0], ['N', 0, -1.4, 0], ['C', 1.21, -0.7, 0],
    ['C', 1.21, 0.7, 0], ['C', 0, 1.4, 0], ['N', 0, 2.75, 0], ['N', 2.5, 1.1, 0],
    ['C', 3.2, 0, 0], ['N', 2.5, -1.1, 0], ['H', -0.9, 3.3, 0], ['H', 0.9, 3.3, 0],
    ['H', -2.15, -1.2, 0], ['H', 4.25, 0, 0], ['H', 2.9, -2.0, 0],
  ] };
  // Guanine: 0 N1,1 C2,2 N3,3 C4,4 C5,5 C6,6 O6,7 N2,8 N7,9 C8,10 N9,11 H(N1),12 H(N2),13 H(N2),14 H(C8),15 H(N9)
  const guanine = { atoms: [
    ['N', -1.21, 0.7, 0], ['C', -1.21, -0.7, 0], ['N', 0, -1.4, 0], ['C', 1.21, -0.7, 0],
    ['C', 1.21, 0.7, 0], ['C', 0, 1.4, 0], ['O', 0, 2.62, 0], ['N', -2.4, -1.4, 0],
    ['N', 2.5, 1.1, 0], ['C', 3.2, 0, 0], ['N', 2.5, -1.1, 0], ['H', -2.15, 1.2, 0],
    ['H', -3.3, -0.9, 0], ['H', -2.4, -2.4, 0], ['H', 4.25, 0, 0], ['H', 2.9, -2.0, 0],
  ] };

  // ---- the open DNA behind (hero) + loose letters drifting around it
  const dna = M.helix({ x: 960, y: 720, length: 1340, z: -180, at: 0 });
  M.swarm('adenine', { n: 18, r: 36, box: [140, 190, 1780, 860], at: 0 });

  // ---- A–T: thymine waits, adenine flies in and locks on "fits"
  const T = M.molecule(thymine, { x: 520, y: 340, z: 80, r: 120, at: 0 });
  const A = M.molecule(adenine, { x: 2150, y: 260, z: -400, r: 140, at: 0 });
  const tFits = P.cw(1, 'fits');
  M.cam(P.c(1, -0.4), { to: T, zoom: 1.5, dur: 1.6 });
  A.to(P.c(1, 0), { x: 750, y: 340, z: 80 }, Math.max(0.6, tFits - P.c(1, 0)));
  T.glow(tFits);

  const t2 = P.cw(1, '2');
  M.link({ of: T, part: 9 }, { of: A, part: 0 }, { at: t2 });
  M.link({ of: T, part: 7 }, { of: A, part: 10 }, { at: t2 + 0.25 });
  M.label(T, 'A–T', { at: t2, sub: '2 bonds', side: 'left' });

  // ---- G–C: guanine waits on the right, cytosine snaps in on "3"
  const t3 = P.cw(2, '3');
  const G = M.molecule(guanine, { x: 1440, y: 340, z: 80, r: 140, at: 0 });
  const C = M.molecule(cytosine, { x: 1000, y: 200, z: -300, r: 120, at: P.c(2, -0.6) });
  M.cam(P.c(2, -0.2), { to: G, zoom: 1.5, yaw: 12, dur: 1.8 });
  C.to(P.c(2, 0), { x: 1210, y: 340, z: 80 }, Math.max(0.6, t3 - P.c(2, 0) - 0.1));
  M.link({ of: C, part: 6 }, { of: G, part: 12 }, { at: t3 });
  M.link({ of: C, part: 2 }, { of: G, part: 11 }, { at: t3 + 0.15 });
  M.link({ of: C, part: 8 }, { of: G, part: 6 }, { at: t3 + 0.3 });
  G.glow(t3);
  M.label(G, 'G–C', { at: t3 + 0.2, sub: '3 bonds', side: 'right' });

  // ---- both old strands pick their new partners, one after another; pull back
  const t4 = P.c(3);
  M.cam(t4, { zoom: 1, to: [960, 540, 0], dur: 2.4 });
  dna.unzip(t4 + 0.3, { dur: Math.max(2.5, P.endT - t4 - 0.3), copy: true });
  M.label({ of: dna, part: 'fork' }, 'Old strands', { at: P.cw(3, 'strand', 0.2) });
});
