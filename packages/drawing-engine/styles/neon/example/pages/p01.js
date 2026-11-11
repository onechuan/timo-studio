ENGINE.visual('p01', (P) => {
  P.title('下一个十年');
  P.horizon({ y: 690, sun: { x: 1290, r: 250 }, at: 0 });
  P.skyline({ y: 690, h: 230, x0: 0, x1: 760, at: 0.2 });
  P.label(140, 214, 'YEAR 2035 // FORECAST', { at: P.c(0, 0.1), no: '01' });
  P.sign('每个人的口袋里', { x: 140, y: 270, size: 88, color: 'blue', at: P.c(0, 0.3) });
  P.sign('一个 {r:AI} 助手', { x: 140, y: 390, size: 140, color: 'purple', at: P.cw(1, 'AI', -0.2) });
  P.glitch(1340, 215, { to: 300, unit: '次/天', size: 200, color: 'red', align: 'c', at: P.cw(2, '300', -0.7) });
  P.label(1340, 172, 'QUERIES PER PERSON PER DAY', { at: P.c(2, 0.6), align: 'c', color: 'soft' });
  P.push(P.c(3), 960, 540, 1.08);
});
