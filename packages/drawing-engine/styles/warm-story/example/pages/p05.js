/* p05 Time: a mountain path that keeps getting steeper; the coin pauses at year 10, then charges up the last steep stretch. */
ENGINE.visual('p05', (P) => {
  P.title('增长都在后面', { accent: 'green' });
  // the road follows the real balance: years 0→30 left to right, height ∝ money (180,000 at year 10, 1.49 million at year 30)
  const bal = (y) => ((Math.pow(1 + 0.08 / 12, y * 12) - 1) / (0.08 / 12)) * 1000;
  const pt = (y) => [240 + (y / 30) * 1460, 820 - (bal(y) / bal(30)) * 560];
  const pts = []; for (let y = 0; y <= 30; y += 0.5) pts.push(pt(y).map((v) => +v.toFixed(1)));
  const t0 = P.c(0), t2 = P.c(2), t3 = P.c(3);
  // a quiet mountain range behind the road: the climb is the metaphor
  P.path('M-200 800 L320 560 L560 700 L900 430 L1180 600 L1520 300 L2120 700 L2120 905 L-200 905 Z', { at: 0, fill: 'greenF', color: 'greenF', dur: 0.3 });
  P.path('M-200 840 C 500 800 1100 860 2120 820 L2120 905 L-200 905 Z', { at: 0, fill: 'green', color: 'green', dur: 0.3 });
  const road = P.trail(pts, { at: 0, progress: (lt) => PV.ease.out(PV.clamp((lt + 0.6) / 3.2)), width: 30, color: 'orange' });
  // the coin rolls along the road: to year 10 by the third sentence, holds, then climbs the steep end
  const year = (lt) => (lt < t2 ? PV.lerp(0, 10, PV.ease.inOut(PV.clamp((lt - t0 - 0.6) / (t2 - t0 - 0.6)))) : PV.lerp(10, 30, PV.ease.inOut(PV.clamp((lt - t3) / 2.2))));
  P.coin((lt) => pt(year(lt))[0], (lt) => pt(year(lt))[1] - 34, 30, { at: t0 + 0.4 });
  for (const y of [10, 20, 30]) P.tag(pt(y)[0], 870, `${y}年`, { at: 0.2 + y * 0.03, size: 34, bg: 'mutedF', color: 'soft' });
  P.tag(pt(10)[0], pt(10)[1] - 110, '18万', { at: t2 + 0.3, size: 46, bg: 'paper', color: 'ink' });
  P.tag(pt(30)[0] - 120, pt(30)[1] + 40, '+90万', { at: t3 + 1.6, size: 54, bg: 'greenF', color: 'green' });
  P.cam([P.push(t2, pt(10)[0] + 120, pt(10)[1] - 40, 1.2), P.pan(t3 + 0.2, 1380, 420), P.back(t3 + 2.6)]);
});
