/* p01 Opening: a long dashed line between the browser and the distant origin; a teal request block slides over and back while the timer rolls to 120 ms. */
ENGINE.visual('p01', (P) => {
  P.title('一来一回 120 ms', { accent: 'blue' });
  const { clamp } = PV, N = PV.NET;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.net({ at: t0 + 0.1, dur: 0.6 });
  const end = P.cw(2, '一百二十毫秒', 0.5), go = Math.max(t1 + 0.1, end - 2.9), mid = (go + end) / 2;
  const keys = [[go, N.browser], [mid - 0.15, N.origin - 190], [mid + 0.15, N.origin - 190], [end, N.browser + 190]];
  P.packets((lt) => (lt < go ? [] : [{ x: PV.keys(keys, lt) }]));
  P.follow((lt) => lt < go ? null : { text: `${Math.round(120 * clamp((lt - go) / (end - go)))} ms`, x: 960, y: 380, color: lt >= end ? 'orange' : 'ink' }, { font: 'mono', size: 64, w: 400 });
  P.cam([P.push(t2, 960, 500, 1.12), P.back(P.endT - 0.2)]);
});
