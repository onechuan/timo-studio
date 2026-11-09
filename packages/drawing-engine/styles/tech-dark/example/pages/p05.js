/* p05 Close: a stream of request blocks leaves the browser; most turn back at the cache as the hit counter climbs, and the origin gets only a few amber requests; the last one turns back at the cache to the browser. */
ENGINE.visual('p05', (P) => {
  P.title('源站只接少数请求', { accent: 'blue' });
  const N = PV.NET;
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.net({ cache: true });
  const [sx, sy] = N.slots[0];
  P.box(sx + 8, sy + 8, 94, 70, { r: 6, color: 'blue', fill: 'blue', at: 0, dur: 0.01, texture: false });
  // request i leaves at start + i·gap; every fifth one misses and goes all the way to the origin
  const start = t0 + 0.3, gap = 0.42, n = Math.max(6, Math.floor((P.endT - 1.6 - start) / gap));
  const miss = (i) => i % 5 === 2 && i < n - 1;
  const trip = (i) => {
    const s = start + i * gap;
    return miss(i) ? [[s, N.browser + 190], [s + 1.1, N.origin - 190], [s + 2.2, N.browser + 190]] : [[s, N.browser + 190], [s + 0.6, N.cache - 190], [s + 1.2, N.browser + 190]];
  };
  P.packets((lt) => {
    const out = [];
    for (let i = 0; i < n; i++) { const k = trip(i); if (lt >= k[0][0] && lt <= k[2][0]) out.push({ x: PV.keys(k, lt), color: miss(i) ? 'orange' : 'blue' }); }
    return out;
  });
  const count = (lt, want) => { let c = 0; for (let i = 0; i < n; i++) if (miss(i) === want && lt >= trip(i)[1][0]) c++; return c; };
  P.follow((lt) => (lt < start + 0.6 ? null : { text: `HIT ${count(lt, false)}`, x: N.cache, y: 320, color: 'green' }), { font: 'mono', size: 52, w: 300 });
  P.follow((lt) => (lt < start + 1.1 ? null : { text: `${count(lt, true)}`, x: N.origin, y: 320, color: 'orange' }), { font: 'mono', size: 52, w: 300 });
  P.cam([P.push(t1, N.cache, 520, 1.08), P.back(t2)]);
});
