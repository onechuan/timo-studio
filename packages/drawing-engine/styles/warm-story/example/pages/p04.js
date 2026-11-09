/* p04 Comparison: two jars side by side, the right one's level surges past the left, the label counts to 1,490,359, and ×4.14 stretches between them. */
ENGINE.visual('p04', (P) => {
  P.title('差了四倍多', { accent: 'red' });
  P.ground(820, { at: 0 });
  const t1 = P.c(1), land = P.cw(2, '一百四十九万', 0.4), t3 = P.c(3);
  // honest proportions: the right jar is 4.14× the height of the left one
  const H = 560, h = H / 4.14;
  P.jar(720, 830, 260, h + 20, { at: 0, level: 1 });
  P.jar(1180, 830, 260, H, { at: 0.15, level: (lt) => PV.ease.out(PV.clamp((lt - t1) / (land - t1))) * 0.97 });
  P.tag(720, 870, '只存', { at: 0.2, size: 38, bg: 'mutedF', color: 'soft' });
  P.tag(1180, 870, '复利', { at: 0.3, size: 38, bg: 'orangeF', color: 'ink' });
  P.tag(720, 600, '360,000', { at: 0.4, size: 44, bg: 'paper', color: 'soft' });
  P.tag(1180, 210, '', { at: t1, size: 52, count: { from: 360000, to: 1490359, at: t1, dur: land - t1 }, bg: 'paper', color: 'ink' });
  P.line(860, 830 - h, 1040, 830 - h, { at: t3, color: 'red', sw: 3, dashed: true, dur: 0.4 });
  P.arrow(950, 830 - h - 10, 950, 300, { at: t3 + 0.2, color: 'red', dur: 0.6 });
  P.tag(950, 470, '×4.14', { at: t3 + 0.5, size: 60, bg: 'redF', color: 'red' });
  P.cam([P.push(P.c(2), 1180, 420, 1.1), P.back(t3)]);
});
