ENGINE.visual('p06', (P) => {
  P.set('blue', { motif: 'room' });
  P.title('回顾：四个动作', { kick: '再记一遍' });

  // the recap row, scaled into the left 3/4 of the frame so the presenter fits on the right
  const L = P.layer();
  L.wrap.style.transformOrigin = '0 0';
  L.wrap.style.transform = 'translate(30px, 60px) scale(0.9)';
  L.recap([
    { thing: 'towel', label: '低姿', color: 'yellow' },
    { thing: 'lock', label: '摸门把', color: 'orange' },
    { thing: 'door', label: '关门', color: 'green' },
    { thing: 'phone', label: '打119', color: 'red' },
  ], { y: 470, r: 135, at: 0.35, gap: 0.45, ticks: P.cw(0, '关门'), size: 50 });

  // the presenter on the right, facing the row
  P.presenter(1700, 855, {
    size: 490, face: 'l',
    hair: 'flat', top: 'orange', accent: 'yellow', tie: 'red',
    pose: [[0, 'point'], [P.cw(0, '关门'), 'present'], [P.c(1), 'wave'], [P.c(2), 'thumbsup']],
    talk: [[0, true], [P.endT, false]],
  });

  // the homework for tonight
  P.headline('今晚就走一遍', 800, 790, { size: 96, font: 'script', plate: 'yellow', at: P.cw(1, '走一遍', -0.3) });
  P.ornament('sparkle', 1290, 700, { size: 90, color: 'yellow', at: P.c(2) });

  P.iris({ at: P.endT - 0.8, x: 1690, y: 430 });
});
