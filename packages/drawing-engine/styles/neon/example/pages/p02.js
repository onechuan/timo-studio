ENGINE.visual('p02', (P) => {
  P.title('一句话的旅程');
  P.rain({ at: 0, op: 0.22 });
  P.node(260, 560, { icon: 'person', color: 'ink', label: '你', at: P.c(0, 0.1), r: 70 });
  P.link(340, 560, 680, 400, { at: P.c(1), color: 'blue', bend: -40, pulses: 2 });
  P.node(760, 380, { label: 'TOKENS', sub: '0110 1001', color: 'blue', at: P.c(1, 0.3), r: 64 });
  P.link(840, 380, 1240, 470, { at: P.c(2), color: 'purple', pulses: 2, bend: -30 });
  P.panel(1260, 270, 520, 420, { label: 'CLOUD // MODEL', color: 'purple', at: P.c(2, 0.2) }).node(1520, 470, { icon: 'brain', color: 'red', label: '模型', at: P.c(2, 0.5), r: 90 });
  P.link(1250, 640, 360, 660, { at: P.c(3, 0.2), color: 'red', bend: 90, pulses: 3, head: true });
  P.glitch(960, 760, { to: 0.8, decimals: 1, unit: '秒', size: 150, color: 'ink', align: 'c', at: P.c(4, -0.2) });
});
