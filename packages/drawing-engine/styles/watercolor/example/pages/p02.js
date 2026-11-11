ENGINE.visual('p02', (P) => {
  P.title('水浅，就托不起大船');
  // a puddle on the floor with a blade of grass floating
  P.paint([{ p: [[180, 640], [330, 600], [560, 610], [640, 660], [520, 720], [260, 720]], color: 'blue', tone: 0.5, bleed: 'green' }], { at: P.c(1, 0.1), fill: P.cw(1, '倒在地上') });
  P.paint([{ p: [[330, 640], [420, 628], [480, 640], [410, 648]], color: 'green', tone: 0.8, bleed: 'yellow' }], { at: P.cw(1, '小草', -0.4), fill: P.cw(1, '小草'), sketch: 0.4 });
  P.label(220, 760, '一根小草：浮起来', { at: P.cw(1, '能浮'), to: [420, 640], size: 38 });
  // the cup stranded
  P.paint([
    { p: [[760, 470], [900, 470], [885, 640], [775, 640]], color: 'orange', tone: 0.55, bleed: 'red' },
    { p: [[900, 510], [950, 520], [945, 590], [893, 600], [896, 575], [925, 570], [925, 535], [898, 535]], color: 'orange', tone: 0.6 },
  ], { at: P.c(2, 0), fill: P.cw(2, '杯子') });
  P.paint([{ p: [[700, 650], [960, 640], [990, 680], [690, 690]], color: 'blue', tone: 0.45 }], { at: P.c(2, 0.2), fill: P.c(2, 0.6), sketch: 0.4 });
  P.label(700, 740, '一只杯子：搁浅', { at: P.cw(2, '搁浅'), size: 38 });
  P.swatch(720, 820, '水 · 太浅', { at: P.cw(3, '不够深'), color: 'red', size: 38 });
  // deep water carrying a great ship
  P.water(1100, 560, 1790, { at: P.c(3, 0), depth: 300, tone: 0.75, color: 'blue' });
  P.paint([
    { p: [[1220, 560], [1660, 560], [1600, 640], [1290, 640]], color: 'red', tone: 0.65, bleed: 'orange' },
    { p: [[1420, 250], [1430, 550], [1250, 540]], color: 'yellow', tone: 0.45, bleed: 'orange' },
    { p: [[1450, 230], [1620, 540], [1450, 545]], color: 'yellow', tone: 0.55 },
  ], { at: P.c(3, 0.3), fill: P.cw(3, '大船'), sketch: 1 });
  P.painted('风 · 水', 1180, 760, { at: P.c(4, 0.2), size: 120, color: 'purple', bleed: 'blue' });
});
