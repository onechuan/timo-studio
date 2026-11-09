ENGINE.visual('p06', (P) => {
  P.title('晚安，月亮');
  const sleepT = P.c(2, 0.4);
  // the bedroom: a bed on the left, a window on the right
  P.thing('bed', 600, 700, { at: 0, size: 560, color: 'blue' });
  // window: night outside, then the frame and its cross bars
  P.crayon([
    { p: [[1130, 230], [1680, 230], [1680, 640], [1130, 640]], color: 'night', line: 'ink' },
  ], { at: 0.1, sketch: 0.5, fill: 0.6, dur: 1.0 });
  P.lines([[[1405, 232], [1405, 638]], [[1132, 435], [1678, 435]]], { at: 1.4, color: 'brown', w: 12 });
  P.crayon([{ p: [[1100, 640], [1710, 640], [1710, 680], [1100, 680]], color: 'brown' }], { at: 1.2, fill: 1.5, dur: 0.6 });
  // the crescent moon with a face, lit on the word
  P.moon(1530, 365, 120, { at: P.cw(0, '月亮', 0.1), phase: 0.2, face: true,
    mood: [[0, 'happy'], [P.cw(2, '晚安'), 'sleepy']] });
  P.note(820, 300, '月亮没有变', { at: P.cw(0, '没有'), size: 46, color: 'purple', to: [1430, 340] });
  // 朵朵 at the window, looking up and waving
  P.kid(1200, 865, { at: 0.3, size: 420, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true, look: 1,
    pose: [[0, 'stand'], [P.c(0, 2.2), 'think'], [P.cw(1, '抬头'), 'point'], [P.cw(1, '样子'), 'wave']],
    mood: [[0, 'happy'], [P.c(0, 2.2), 'calm'], [P.cw(1, '抬头'), 'surprised'], [P.cw(1, '样子'), 'laugh']],
    out: sleepT });
  // ...then asleep in the bed
  P.kid(820, 650, { at: sleepT, size: 400, dress: true, shirt: 'yellow', hairStyle: 'pigtails', bow: true,
    rot: -1.57, pose: 'sleep', mood: 'sleepy' });
  P.words('晚安', 1400, 720, { at: P.cw(2, '晚安'), size: 150, align: 'c', colors: ['purple', 'blue'] });
  P.twinkle(1540, 340, { at: P.cw(2, '晚安', 0.3), r: 150, stay: true });
});
