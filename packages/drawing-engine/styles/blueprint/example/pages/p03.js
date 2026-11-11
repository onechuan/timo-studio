/* p03 Pipe and valve: a pipe run is drafted in section, water flows through, the elbow narrows by half (dimensioned), the red pencil circles the leak point. */
ENGINE.visual('p03', (P) => {
  P.title('压力从哪里漏掉');
  const top = 420, bot = 520;
  P.draft([`M260 ${top}H900Q1060 ${top} 1060 ${top + 160}V860`, `M260 ${bot}H880Q960 ${bot} 960 ${bot + 80}V860`], { at: 0.05, speed: 1600 });
  P.draft(PV.BP.rect(470, top - 70, 120, 240, 0), { at: P.c(0, 0.8), hatch: true });
  P.draft(PV.BP.circle(530, top - 120, 50) + `M530 ${top - 70}V${top}`, { at: P.c(0, 1.3) });
  P.label(470, top - 220, 'VALVE V-1', { at: P.c(0, 1.6) });
  P.flow(`M260 ${(top + bot) / 2}H920Q1010 ${(top + bot) / 2} 1010 ${top + 160}V860`, { at: P.c(0, 0.6), speed: 300, n: 9 });
  P.dim(1060, 860, 960, 860, { at: P.c(1, 0.2), value: 50, unit: 'mm', off: 46, color: 'yellow' });
  P.dim(260, top, 260, bot, { at: P.c(1, 0.8), value: 100, unit: 'mm', off: 46 });
  P.pencil({ ring: [1010, top + 90, 230, 200] }, { at: P.cw(2, '最容易漏', -0.3), note: '漏点 P max', nx: 1180, ny: top - 10 });
  P.outline('×2', 1300, 560, { size: 220, at: P.c(1, 1.2), color: 'red', fill: 'redF' });
});
