/* p01 Gear ratio: a 36-tooth gear drafted on the left, a 12-tooth gear meshing on the right; both turn at 1:3, the ratio traced huge. */
ENGINE.visual('p01', (P) => {
  P.title('大齿轮带小齿轮');
  const A = [660, 500], R = 270, Bc = [660 + 270 + 86, 500], r = 90;
  P.draft(`M${A[0] - 340} ${A[1]}H${Bc[0] + 160}M${A[0]} ${A[1] - 330}V${A[1] + 330}M${Bc[0]} ${A[1] - 150}V${A[1] + 150}`, { at: 0.05, line: 'center', color: 'soft', dur: 0.6 });
  const spinA = (lt) => ({ rot: Math.max(0, lt - P.c(2)) * 40, cx: A[0], cy: A[1] });
  const spinB = (lt) => ({ rot: -Math.max(0, lt - P.c(2)) * 120 + 15, cx: Bc[0], cy: Bc[1] });
  P.draft(PV.BP.gear(A[0], A[1], R, 36, 22, 60) + PV.BP.circle(A[0], A[1], R - 70), { at: P.c(0, 0.1), speed: 1800, fill: 'inkF', move: spinA });
  P.dim(A[0] - R, A[1] + R + 10, A[0] + R, A[1] + R + 10, { at: P.cw(0, '三十六', -0.3), text: '36 T', off: 50 });
  P.draft(PV.BP.gear(Bc[0], Bc[1], r, 12, 20, 24), { at: P.c(1, 0.1), speed: 1500, fill: 'inkF', move: spinB });
  P.callout(Bc[0] + 60, Bc[1] - 60, 2, { at: P.cw(1, '十二', 0), bx: Bc[0] + 230, by: Bc[1] - 230, text: '12 T' });
  P.callout(A[0] - 150, A[1] - 190, 1, { at: P.c(0, 1.2), bx: A[0] - 320, by: A[1] - 290, text: '36 T', side: 'l' });
  P.outline('1 : 3', 1270, 560, { size: 210, at: P.cw(2, '三圈', -0.6), fill: 'yellow', fillOp: 0.25, color: 'yellow' });
  P.label(1290, 820, 'RATIO · OUTPUT ×3', { at: P.cw(2, '三圈', 0.4), size: 28 });
  P.cam([P.push(P.cw(2, '三圈', -0.2), 960, 520, 1.04)]);
});
