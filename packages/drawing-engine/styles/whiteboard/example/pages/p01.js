/* p01 Opening: a person sits behind a desk while message bubbles are drawn in from all sides, one after another, poking at them; a to-do pad on the right lists four things, with a big red question mark beside it. */
ENGINE.visual('p01', (P) => {
  P.title('一个下午去哪了？', { accent: 'red' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.icon('person', 620, 540, 230, { at: t0 + 0.1 });
  P.line(260, 680, 980, 680, { at: t0 + 0.5, dur: 0.6, sw: 4 });
  P.line(320, 680, 320, 820, { at: t0 + 1.0, dur: 0.3 });
  P.line(920, 680, 920, 820, { at: t0 + 1.1, dur: 0.3 });
  // the to-do notebook
  P.box(1200, 250, 480, 560, { r: 14, at: t0 + 0.3, dur: 0.8 });
  P.text('待办', { x: 1440, y: 280, w: 300, align: 'c', size: 48, weight: 700, at: t0 + 0.9, cps: 8 });
  ['写报告', '回邮件', '改方案', '读资料'].forEach((s, i) => {
    P.rect(1250, 384 + i * 96, 40, 40, { at: t0 + 1.2 + i * 0.3, dur: 0.25, sw: 2.6 });
    P.text(s, { x: 1316, y: 372 + i * 96, size: 46, at: t0 + 1.3 + i * 0.3, cps: 12 });
  });
  // messages arrive one after another and poke at the desk
  [[290, 300, 470, 450], [620, 220, 620, 380], [960, 290, 770, 450], [1060, 520, 800, 560]].forEach(([x, y, x2, y2], i) => {
    const at = t1 + i * 0.45;
    P.icon('chat', x, y, 120, { at, color: 'blue' });
    P.arrow(x + (x2 - x) * 0.32, y + (y2 - y) * 0.32, x2, y2, { at: at + 0.25, dur: 0.35, color: 'blue', sw: 3 });
  });
  P.text('?', { x: 1050, y: 640, w: 120, align: 'c', size: 130, weight: 700, color: 'red', at: t2 + 0.6, cps: 4 });
  P.ring(1110, 740, 150, 170, { at: t2 + 1.1, color: 'red' });
  P.cam([P.push(t1, 680, 420, 1.12), P.back(t2)]);
});
