ENGINE.visual('p01', (P) => {
  const M = P.micro({ mood: 'teal', scale: '2 µm' });
  P.title('Every new cell needs a copy');

  // Hero: a whole cell, off-centre
  const cell = M.cell({ x: 1000, y: 520, r: 420, at: 0 });

  // Depth: neighbours behind and in front
  M.blob({ x: 280, y: 330, z: -750, r: 160, color: 'purple', opacity: 0.35, at: 0 });
  M.blob({ x: 1650, y: 760, z: -600, r: 110, opacity: 0.3, at: 0 });
  M.molecule('H2O', { x: 260, y: 700, z: 240, r: 70, at: 0 });
  M.molecule('H2O', { x: 1700, y: 260, z: 180, r: 55, at: 0.3 });

  const cellLab = M.label(cell, 'Cell', { at: P.c(0, 0.8), side: 'left' });
  cellLab.hide(P.c(1, 0.2));

  // The DNA strand: tiny, sitting just under the cell surface, ready for the dive
  const sp = cell.spot(-20, 15);
  const dna = M.helix({ x: sp[0], y: sp[1], z: sp[2], length: 70, r: 8, at: 0,
    seq: 'ATGCGTACCGTAGCTAGGCTTACGATCG' });

  // Beat 2: dive from the cell down to the strand
  M.diveTo(dna, P.c(1, 0.3), 3.5, { fill: 0.75 });
  M.label(dna, 'DNA', { at: P.c(1, 4.0), sub: 'double helix' });

  // Beat 3: base pairs glow, "3 billion letters"
  dna.glow(P.cw(2, 'billion', -0.2));
  M.number(560, 700, 3, { at: P.cw(2, 'billion', -0.3), unit: 'billion letters', size: 110 });

  // Beat 4: slow orbit along the strand while "a few hours, almost no mistakes"
  M.focus(dna, P.c(3, 0.1), 1.5);
  dna.glow(P.cw(3, 'mistakes', -0.3));
});
