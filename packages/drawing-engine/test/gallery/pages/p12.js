// matrix.js — matrix, tape, editor, flipc, stage3d; PV.bytes
ENGINE.visual('p12', (P) => {
  P.title('matrix.js · matrix / tape / editor / flipc / stage3d');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.matrix({ x: 120, y: 240, cw: 110, ch: 80, rows: [{ label: '甲', color: 'blue' }, { label: '乙', color: 'green' }, { label: '丙', color: 'orange' }], cols: [{ label: 'A' }, { label: 'B' }, { label: 'C' }],
    fillAt: (i, j) => t0 + 0.4 + (i * 3 + j) * 0.08, collapse: t2, hub: { x: 400, y: 800, label: '中间层', d: 140 }, at: t0, head: 130 });
  const E = P.editor(760, 240, 520, 300, { at: t0, title: 'log' });
  const line = '{"ok":true}';
  P.tape(E.x, E.y, E.w, E.h, [{ t: t0 + 0.6, dir: 'r', text: '{"get":1}' }, { t: t1, dir: 'l', text: line, bytes: PV.bytes(line) }], { at: t0 });
  const [F, Bk] = P.flipc(1560, 380, { at: t1 + 0.4 });
  F.box(1400, 300, 320, 160, { r: 16, fill: 'blueF', color: 'blue', at: t0, dur: 0.3, texture: false });
  Bk.box(1400, 300, 320, 160, { r: 16, fill: 'orangeF', color: 'orange', at: t0, dur: 0.3, texture: false });
  const S = P.stage3d({ cx: 1100, cy: 760, tilt: (lt) => ({ rx: 20, ry: -30 * PV.K(lt, t2, 0.8) }) });
  S.plane(-80).box(980, 680, 240, 140, { r: 12, fill: 'greenF', color: 'green', at: t0, dur: 0.3, texture: false });
  S.plane(40).box(1020, 720, 240, 140, { r: 12, fill: 'purpleF', color: 'purple', at: t0 + 0.2, dur: 0.3, texture: false });
});
