/* p05 Close: a row of four tomatoes is drawn left to right, each with one task written under it; the green marker ticks them one by one and the last is circled. */
ENGINE.visual('p05', (P) => {
  P.title('一件一件做完', { accent: 'green' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const xs = [330, 750, 1170, 1590], Y = 410, d = 220;
  const tasks = ['写报告', '回邮件', '改方案', '读资料'];
  xs.forEach((x, i) => {
    const at = t0 + 0.2 + i * 0.5;
    P.circle(x, Y, d, { color: 'red', fill: 'redF', at, dur: 0.5 });
    P.path(`M${x} ${Y - d / 2 + 4} l-36 -20 M${x} ${Y - d / 2 + 4} l36 -20 M${x} ${Y - d / 2 + 4} v-32`, { color: 'green', at: at + 0.4, dur: 0.3, sw: 3.6 });
    P.line(x, Y + d / 2 + 14, x, Y + d / 2 + 64, { color: 'muted', at: t1 + i * 0.4, dur: 0.2, sw: 2.6 });
    P.text(tasks[i], { x, y: Y + d / 2 + 80, w: 300, align: 'c', size: 54, at: t1 + 0.1 + i * 0.4, cps: 12 });
    P.check(x + 120, Y + d / 2 + 120, 64, { at: t2 + 0.3 + i * 0.6 });
  });
  P.arrow(200, 820, 1720, 820, { at: t0 + 0.4, dur: 1.0, color: 'soft' });
  P.text('一个下午', { x: 960, y: 740, w: 400, align: 'c', size: 40, color: 'soft', at: t0 + 1.2, mode: 'fade' });
  P.ring(xs[3] + 20, Y + d / 2 + 116, 320, 130, { at: t2 + 2.6, color: 'green' });
  P.cam([P.pan(t1, 960, 560, 1.06), P.back(t2)]);
});
