/* p03 Breaks: on a timeline, one tomato followed by a short green break cell, then three more, bracketed above with ×4; at the end a long 15–30 break cell stretches out with a cup of tea on it. */
ENGINE.visual('p03', (P) => {
  P.title('四个番茄，一次长休', { accent: 'green' });
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const Y = 600, d = 130;
  P.arrow(160, Y + 90, 1760, Y + 90, { at: t0, dur: 0.8, color: 'soft' });
  const tomato = (cx, at) => {
    P.circle(cx, Y, d, { color: 'red', fill: 'redF', at, dur: 0.45 });
    P.path(`M${cx} ${Y - d / 2 + 4} l-22 -14 M${cx} ${Y - d / 2 + 4} l22 -14 M${cx} ${Y - d / 2 + 4} v-20`, { color: 'green', at: at + 0.35, dur: 0.25, sw: 3.4 });
  };
  const xs = [250, 490, 730, 970];
  xs.forEach((x, i) => {
    const at = i === 0 ? t0 + 0.3 : t1 + (i - 1) * 0.55;
    tomato(x, at);
    if (i < 3) {
      P.box(x + 80, Y - 32, 80, 64, { r: 10, color: 'green', fill: 'greenF', at: at + (i === 0 ? 0.9 : 0.35), dur: 0.35 });
      P.text('5', { x: x + 120, y: Y - 30, w: 80, align: 'c', size: 44, weight: 700, color: 'green', at: at + (i === 0 ? 1.2 : 0.55), mode: 'fade', dur: 0.2 });
    }
  });
  P.text('25', { x: 250, y: Y - 28, w: 120, align: 'c', size: 44, weight: 700, at: t0 + 0.8, mode: 'fade', dur: 0.2 });
  // a brace over the four tomatoes
  P.path(`M${xs[0] - 70} ${Y - 110} Q${xs[0] - 70} ${Y - 140} ${xs[0] - 40} ${Y - 140} H${(xs[0] + xs[3]) / 2 - 30} L${(xs[0] + xs[3]) / 2} ${Y - 170} L${(xs[0] + xs[3]) / 2 + 30} ${Y - 140} H${xs[3] + 40} Q${xs[3] + 70} ${Y - 140} ${xs[3] + 70} ${Y - 110}`, { at: t1 + 1.8, dur: 0.6, color: 'blue', sw: 3 });
  P.text('×4', { x: (xs[0] + xs[3]) / 2, y: Y - 260, w: 200, align: 'c', size: 72, weight: 700, color: 'blue', at: t1 + 2.3, cps: 6 });
  // the long break, with a cup of tea above it
  P.box(1080, Y - 50, 600, 100, { r: 14, color: 'green', fill: 'greenF', at: t2 + 0.1, dur: 0.7 });
  P.text('15–30 分钟', { x: 1380, y: Y - 34, w: 600, align: 'c', size: 50, weight: 700, color: 'green', at: P.cw(2, '十五到三十分钟'), cps: 10 });
  const cx = 1380, cy = 380;
  P.path(`M${cx - 70} ${cy - 40} H${cx + 70} L${cx + 56} ${cy + 60} H${cx - 56} Z M${cx + 66} ${cy - 16} C${cx + 120} ${cy - 16} ${cx + 120} ${cy + 36} ${cx + 60} ${cy + 36}`, { at: t2 + 0.6, dur: 0.7 });
  P.curve([[cx - 24, cy - 60], [cx - 36, cy - 90], [cx - 18, cy - 120], [cx - 30, cy - 150]], { at: t2 + 1.2, dur: 0.4, color: 'muted', sw: 2.6 });
  P.curve([[cx + 20, cy - 60], [cx + 8, cy - 90], [cx + 26, cy - 120], [cx + 14, cy - 150]], { at: t2 + 1.4, dur: 0.4, color: 'muted', sw: 2.6 });
  P.cam([P.push(t1, 640, 560, 1.08), P.pan(t2, 1000, 520), P.back(P.endT - 0.3)]);
});
