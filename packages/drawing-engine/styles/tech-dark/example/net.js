/* Shared diagram of the caching benchmark film: three boxes (browser, cache node, origin) on a dashed line, and request blocks moved by keyframes. */
(function () {
  const { clamp, lerp, ease, Builder } = PV;
  const B = Builder.prototype;
  const NET = { y: 540, browser: 310, cache: 960, origin: 1610, w: 300, h: 280 };
  NET.left = (cx) => cx - NET.w / 2;
  /** piecewise eased position: keys [[t, x], ...] → x at lt */
  PV.keys = (keys, lt) => {
    if (lt <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (lt <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease.inOut(clamp((lt - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]))));
    return keys[keys.length - 1][1];
  };
  /** the diagram: o.at (when it draws; 0 with o.dur 0.01 = already there), o.cache (draw the cache node), o.cacheAt, o.label */
  B.net = function (o = {}) {
    const at = o.at ?? 0, dur = o.dur ?? 0.01, y0 = NET.y - NET.h / 2;
    // browser: a window with a title bar and three dots
    this.box(NET.left(NET.browser), y0, NET.w, NET.h, { r: 14, color: 'soft', fill: 'paper', at, dur });
    this.line(NET.left(NET.browser), y0 + 46, NET.left(NET.browser) + NET.w, y0 + 46, { color: 'faint', at: at + dur, dur, sw: 2 });
    [0, 1, 2].forEach((i) => this.circle(NET.left(NET.browser) + 28 + i * 24, y0 + 23, 12, { color: 'muted', fill: 'muted', at: at + dur, dur }));
    // origin: a rack with three units and status lights
    this.box(NET.left(NET.origin), y0, NET.w, NET.h, { r: 14, color: o.originColor || 'soft', fill: 'paper', at: at + dur * 0.5, dur });
    [0, 1, 2].forEach((i) => {
      this.box(NET.left(NET.origin) + 30, y0 + 34 + i * 76, NET.w - 60, 56, { r: 8, color: 'faint', fill: 'inkF', at: at + dur, dur });
      this.circle(NET.left(NET.origin) + NET.w - 56, y0 + 62 + i * 76, 12, { color: 'green', fill: 'green', at: at + dur, dur });
    });
    this.text('浏览器', { x: NET.browser, y: y0 + NET.h + 18, w: 300, align: 'c', size: 40, color: 'soft', at: at + dur, mode: 'fade' });
    this.text('源站', { x: NET.origin, y: y0 + NET.h + 18, w: 300, align: 'c', size: 40, color: 'soft', at: at + dur, mode: 'fade' });
    // the long road between them
    const road = this.line(NET.left(NET.browser) + NET.w + 14, NET.y, NET.left(NET.origin) - 14, NET.y, { color: 'faint', sw: 2.4, at: at + dur, dur: Math.max(dur, 0.01) });
    this.dashify(road);
    if (o.cache) {
      const ca = o.cacheAt ?? at, cd = o.cacheDur ?? dur;
      this.box(NET.left(NET.cache), y0, NET.w, NET.h, { r: 14, color: 'blue', fill: 'blueF', at: ca, dur: cd });
      NET.slots.forEach(([x, y]) => this.box(x, y, 110, 86, { r: 8, color: 'faint', at: ca + cd * 0.6, dur: cd * 0.6 + 0.01 }));
      if (o.label !== false) this.text('cache', { x: NET.cache, y: y0 + NET.h + 18, w: 300, align: 'c', size: 40, font: 'mono', color: 'blue', at: ca + cd, mode: 'fade' });
    }
    return NET;
  };
  NET.slots = [[NET.cache - 125, NET.y - 106], [NET.cache + 15, NET.y - 106], [NET.cache - 125, NET.y + 20], [NET.cache + 15, NET.y + 20]];
  /** packets drawn every frame: list(lt) → [{ x, color }] */
  B.packets = function (list) {
    return this.liveRough((lt, R) => list(lt).map((p) => R.box(p.x - 24, NET.y - 24, 48, 48, { r: 8, color: p.color || 'blue', fill: p.color || 'blue', sw: 2 })));
  };
  PV.NET = NET;
})();
