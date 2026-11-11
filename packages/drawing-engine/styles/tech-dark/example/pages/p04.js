/* p04 Expiry: a teal lifetime bar grows under the copy cell; a response-header code card types out line by line with the max-age line highlighted; the bar shrinks to zero, the copy greys out, and the next request passes through the cache to the origin. */
ENGINE.visual('p04', (P) => {
  P.title('副本会过期', { accent: 'orange' });
  const { clamp, ease } = PV, N = PV.NET;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.net({ cache: true, label: false });
  const [sx, sy] = N.slots[0];
  const dead = t2 + 0.2;
  // the copy turns grey when its time runs out
  P.liveRough((lt, R) => [R.box(sx + 8, sy + 8, 94, 70, { r: 6, color: lt < dead ? 'blue' : 'faint', fill: lt < dead ? 'blue' : 'faint', sw: 2 })]);
  P.follow((lt) => ({ text: lt < dead ? '副本' : '过期', x: sx + 55, y: sy + 16, color: lt < dead ? 'paper' : 'muted' }), { size: 36, w: 120, weight: 700 });
  // TTL bar under the cache: grows in, then drains to zero just as the sentence says it expires
  const bx = N.left(N.cache) + 20, by = N.y + N.h / 2 + 26, bw = N.w - 40;
  P.text('TTL', { x: bx - 90, y: by - 14, size: 32, font: 'mono', color: 'blue', at: t0 + 0.3, mode: 'fade' });
  P.liveRough((lt, R) => {
    const k = ease.out(clamp((lt - t0 - 0.3) / 0.6)) * (1 - clamp((lt - (dead - 1.4)) / 1.4));
    return [R.box(bx, by, bw, 18, { r: 6, color: 'faint', sw: 1.6 }), ...(k > 0.01 ? [R.box(bx, by, bw * k, 18, { r: 6, color: 'blue', fill: 'blue', sw: 1.6 })] : [])];
  });
  const code = P.code(['HTTP/1.1 200 OK', 'Cache-Control: max-age=3600'], { x: 560, y: 200, w: 800, size: 30, at: t1 - 0.3 });
  code.hl(1, P.cw(1, '三千六百秒'), { c0: 15, n: 12, color: 'blue' });
  // the next request goes straight through to the origin
  const go = dead + 0.2, far = go + 1.4;
  P.packets((lt) => (lt < go ? [] : [{ x: PV.keys([[go, N.browser + 190], [far, N.origin - 190]], lt), color: 'orange' }]));
  P.cam([P.push(P.cw(1, '三千六百秒'), 960, 460, 1.08), P.back(t2)]);
});
