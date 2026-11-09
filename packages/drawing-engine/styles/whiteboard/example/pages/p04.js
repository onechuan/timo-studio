/* p04 Interrupted: a message bubble with an arrow rushes at the running tomato, the arrow is bent toward a sticky note reading 「稍后：回消息」 (later: reply); the tomato completes its sweep and gets a green tick. */
ENGINE.visual('p04', (P) => {
  P.title('先记下来', { accent: 'orange' });
  const { clamp, lerp } = PV;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const T = { x: 560, y: 560, r: 200 };
  P.circle(T.x, T.y, T.r * 2, { color: 'red', fill: 'redF', at: 0, dur: 0.6 });
  P.path(`M${T.x} ${T.y - T.r + 6} l-60 -26 M${T.x} ${T.y - T.r + 6} l60 -26 M${T.x} ${T.y - T.r + 6} v-44`, { color: 'green', at: 0.4, dur: 0.4, sw: 4 });
  const done = P.c(2, 1.4);
  P.liveRough((lt, R) => {
    const k = lt < t0 ? 0.3 : lerp(0.3, 1, clamp((lt - t0) / (done - t0)));
    const r = T.r - 24;
    if (k >= 0.999) return [R.circle(T.x, T.y, r * 2, { color: 'red', fill: 'red', fillStyle: 'hachure', gap: 16, fw: 2.4, sw: 2.6 })];
    const a = -Math.PI / 2 + k * Math.PI * 2;
    return [R.path(`M${T.x} ${T.y} L${T.x} ${T.y - r} A${r} ${r} 0 ${k > 0.5 ? 1 : 0} 1 ${(T.x + Math.cos(a) * r).toFixed(1)} ${(T.y + Math.sin(a) * r).toFixed(1)} Z`, { color: 'red', fill: 'red', fillStyle: 'hachure', gap: 16, fw: 2.4, sw: 2.6 })];
  });
  // the interruption heads for the tomato, then gets redirected to the note
  P.icon('chat', 1440, 270, 140, { at: t0 + 0.1, color: 'blue' });
  P.arrow(1360, 300, T.x + T.r + 30, T.y - 140, { at: t0 + 0.5, dur: 0.6, color: 'blue', sw: 3.4, dashed: true }).hide(t1 + 0.2, 0.4);
  P.cross(T.x + T.r + 70, T.y - 160, 50, { at: t1, color: 'red' }).hide(t1 + 0.2, 0.4);
  P.arrow(1440, 350, 1440, 530, { at: t1 + 0.4, dur: 0.4, color: 'blue', sw: 3.4 });
  P.box(1220, 550, 440, 220, { r: 10, color: 'orange', fill: 'orangeF', at: t1 + 0.6, dur: 0.6 });
  P.text('稍后：回消息', { x: 1440, y: 622, w: 440, align: 'c', size: 52, weight: 700, at: P.cw(1, '记在纸上'), cps: 10 });
  P.check(T.x + T.r + 80, T.y + 40, 90, { at: done + 0.1 });
  P.cam([P.push(t1, 1300, 520, 1.12), P.back(t2)]);
});
