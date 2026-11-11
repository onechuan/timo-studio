// debris.js — demo, fall, srv; PV.blink
ENGINE.visual('p04', (P) => {
  P.title('debris.js · srv / demo / fall');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.srv(300, 300, 640, 460, '服务器', { at: t0 });
  P.demo(980, 300, { at: t0 + 0.4 });
  const L = P.layer();
  L.box(400, 420, 200, 120, { r: 12, fill: 'redF', color: 'red', at: t0 + 0.3, dur: 0.3, texture: false });
  L.text('旧进程', { x: 500, y: 455, w: 200, align: 'c', size: 32, weight: 700, color: 'red', at: t0 + 0.4, mode: 'fade' });
  P.fall(L, t2, { origin: [500, 480], spin: 40 });
  P.liveRough((lt, R) => [R.circle(880, 360, 30, { fill: PV.blink(lt, t1) ? 'green' : 'greenF', color: 'green', seed: 3 })]);
});
