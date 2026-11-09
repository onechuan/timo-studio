/* p03 Hit: a second request block slides to the cache, the copy cell lights up with a green HIT and the block turns back at the cache; the timer only rolls to 5 ms and the 120 ms beside it is struck out. */
ENGINE.visual('p03', (P) => {
  P.title('第二次：5 ms', { accent: 'blue' });
  const { clamp } = PV, N = PV.NET;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.net({ cache: true, originColor: 'faint' });
  const [sx, sy] = N.slots[0];
  P.box(sx + 8, sy + 8, 94, 70, { r: 6, color: 'blue', fill: 'blue', at: 0, dur: 0.01, texture: false });
  P.text('副本', { x: sx + 55, y: sy + 16, w: 120, align: 'c', size: 36, weight: 700, color: 'paper', at: 0, mode: 'fade', dur: 0.01 });
  P.text('120 ms', { x: N.origin, y: 330, w: 300, align: 'c', size: 52, font: 'mono', color: 'muted', at: 0.2, mode: 'fade' });
  const go = t0 + 0.4, hit = t1 + 0.3, land = Math.max(hit + 0.9, P.cw(2, '五毫秒', 0.3));
  P.packets((lt) => (lt < go ? [] : [{ x: PV.keys([[go, N.browser + 190], [hit, N.cache - 190], [land, N.browser + 190]], lt) }]));
  P.box(sx - 4, sy - 4, 118, 94, { r: 10, color: 'blue', sw: 4, at: hit, dur: 0.3, texture: false });
  P.chip(N.cache - 80, 300, 160, 'HIT', { color: 'green', at: hit, h: 56, size: 30 });
  P.follow((lt) => lt < go ? null : { text: `${Math.round(5 * clamp((lt - go) / (land - go)))} ms`, x: 640, y: 380, color: lt >= land ? 'blue' : 'ink' }, { font: 'mono', size: 64, w: 300 });
  P.line(N.origin - 100, 362, N.origin + 100, 362, { color: 'muted', sw: 3, at: land + 0.2, dur: 0.3 });
  P.cam([P.push(hit - 0.2, N.cache, 480, 1.1), P.back(land + 0.3)]);
});
