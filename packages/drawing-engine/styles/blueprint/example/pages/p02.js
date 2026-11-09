/* p02 Exploded pen: the five parts drafted assembled, then they slide apart on the beat with numbered balloons; the spring gets the red pencil. */
ENGINE.visual('p02', (P) => {
  P.title('一支圆珠笔的五个零件');
  const y = 470;
  const parts = [
    { d: PV.BP.rect(300, y, 110, 70, -12), dx: -60, dy: 0, n: 1, text: '笔帽' },
    { d: PV.BP.spring(420, y + 35, 560, y + 35, 9, 22), dx: 10, dy: -150, n: 2, text: '弹簧' },
    { d: [PV.BP.rect(560, y + 25, 620, 20), PV.BP.poly([[1180, y + 25], [1230, y + 35], [1180, y + 45]])], dx: 40, dy: 170, n: 3, text: '笔芯', bx: 40, by: 70 },
    { d: PV.BP.rect(420, y - 10, 860, 90, 18), dx: 80, dy: 0, n: 4, text: '笔杆', hatch: true },
    { d: PV.BP.rect(1290, y + 5, 140, 60, 28), dx: 190, dy: 0, n: 5, text: '按钮' },
  ];
  P.draft('M200 505H1720', { at: 0.05, line: 'center', color: 'soft', dur: 0.5 });
  P.explode(parts, { at: P.c(0, 0.1), apart: P.c(1, 0.1) });
  P.label(160, 830, 'EXPLODED VIEW · SCALE 1:1', { at: P.c(0, 0.6) });
  P.pencil({ ring: [500, y - 115, 220, 120] }, { at: P.cw(2, '弹簧', -0.2), note: '手感在这', nx: 620, ny: y - 270 });
});
