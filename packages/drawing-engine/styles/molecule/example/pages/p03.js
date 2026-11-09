ENGINE.visual('p03', (P) => {
  const M = P.micro({ mood: 'violet', scale: '2 nm' });
  P.title('Helicase unzips the helix');

  // Hero: the double helix, on screen from the first frame
  const dna = M.helix({ x: 1060, y: 540, length: 1300, seq: 'ATGCGTACCGATTGCAGTCA', at: 0 });

  // Neighbours at other depths
  M.molecule('H2O', { x: 1620, y: 260, z: 240, r: 60, at: 0 });
  M.molecule('H2O', { x: 420, y: 300, z: 180, r: 50, at: 0 });
  M.molecule('H2O', { x: 1450, y: 800, z: -650, r: 70, at: 0 });
  M.molecule('Na+', { x: 560, y: 250, z: -500, r: 40, at: 0 });

  // Beat 1: helicase drifts in from the left
  const helicase = M.protein({ x: -320, y: 520, z: 0, r: 160, pocket: 'right', at: 0 });
  helicase.to(P.c(0, 0.2), { x: 180, y: 520, z: 0 }, Math.max(1.5, P.cw(0, 'grabs') - 2.8));

  // Beat 2: it grabs the helix end with a flash on "grabs"
  M.dock(dna, helicase, P.cw(0, 'grabs'), { dur: 2.2 });
  const hl = M.label(helicase, 'helicase', { at: P.cw(0, 'grabs', 0.4), sub: 'enzyme' });
  if (hl && hl.hide) hl.hide(P.c(2, 1.5));

  // Beat 3: the helix unzips from the left into a fork; push in on the fork
  const unzipDur = Math.max(4, P.endT - P.c(1) - 1.5);
  dna.unzip(P.c(1, 0.1), { dur: unzipDur, copy: false });
  helicase.to(P.c(1, 0.3), { x: 1600, y: 520, z: 60 }, unzipDur);
  M.cam(P.c(1, 0.2), { to: [900, 540, 0], zoom: 1.4, dur: 2.4 });

  // c2: the weak bonds break at the fork
  M.label({ of: dna, part: 'fork' }, 'weak bonds break', { at: P.cw(2, 'weak'), sub: 'hydrogen bonds' });

  // Beat 4: pull back, two single strands with bare letters waiting
  M.cam(P.c(3, 0), { to: [960, 540, 0], zoom: 1, dur: 2.8 });
  M.label([520, 660, 0], 'single strands', { at: P.cw(3, 'single', 0.2), sub: 'letters exposed' });
});
