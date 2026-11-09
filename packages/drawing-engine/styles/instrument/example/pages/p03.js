ENGINE.visual('p03', (P) => {
  P.title('点火：火花一闪');
  P.caption('四缸汽油机 · 1 缸剖面');

  const spark = P.cw(1, '打火');
  const sparkT = Math.min(P.c(1, 0.6), spark - 0.3);
  const pushT = P.cw(2, '推下去') - 0.3;
  const back = P.c(2, 0.1);
  const t3 = P.c(3);

  // model: crank angle (0 = top dead centre) and cylinder pressure
  const ang = P.track([[0.25, 0], [pushT, 180]], { from: -140 });
  const pr = P.track([[0.25, 14], [spark + 0.05, 60], [pushT, 6]], { from: 4 });

  const S = P.bench({ azimuth: 38, elevation: 34 });
  const z0 = S.base(-130, -80, 260, 160).z;

  // crank bearings
  S.block(-38, -50, z0, 16, 14, 40, { at: 0.1, screws: true });
  S.block(-38, 36, z0, 16, 14, 40, { at: 0.15, screws: true });

  // crank + rod + piston in a cut-open cylinder
  const cr = S.crank(-30, 0, z0 + 40, { r: 26, rod: 82, bore: 22, angle: ang, at: 0.2 });
  let headZ = z0 + 40 + 26 + 82 + 30;
  try {
    const tp = cr && typeof cr.top === 'function' ? cr.top(P.c(1)) : null;
    if (typeof tp === 'number' && isFinite(tp)) headZ = tp + 8;
  } catch (e) {}

  // cylinder head with spark plug
  S.block(-62, -32, headZ, 64, 64, 18, { at: 0.35, groove: true, screws: true });
  const plug = S.cyl(-30, 0, headZ + 18, 6, 24, { at: 0.5, bands: [6, 12], knurl: 8 });
  S.cyl(-30, 0, headZ + 42, 3, 6, { at: 0.55 });

  // ignition coil and its lead to the plug
  S.block(62, -72, z0, 40, 30, 52, { at: 0.3, slots: 3 });
  S.plate(66, -46, z0 + 52, 30, 12, { at: 0.4 });
  const sparkPulse = (lt) => {
    const a = sparkT - 0.35;
    if (lt < a || lt > sparkT + 0.05) return -1;
    return Math.min(1, (lt - a) / 0.35);
  };
  S.wire([[82, -57, z0 + 52], [82, -57, headZ + 50], [-30, -57, headZ + 50], [-30, 0, headZ + 50], [-30, 0, headZ + 48]],
    { at: 0.5, dur: 0.6, pulse: sparkPulse });

  // pressure gauge fed from the cylinder head
  S.block(58, -20, z0, 52, 36, 30, { at: 0.25, screws: true });
  S.pipe([[2, 8, headZ + 9], [74, 8, headZ + 9], [74, 8, z0 + 30]], { at: 0.6, flow: (lt) => (lt > spark && lt < pushT + 0.6 ? 1 : 0) });
  const dial = S.dial(88, 16, z0 + 30, 24, { value: pr, min: 0, max: 80, ticks: 40, major: 5, unit: 'bar', at: 0.4 });

  // the four strokes: one pin per stroke
  const K = (lt, a, d) => PV.K(lt, a, d);
  const pins = S.pins(-116, 52, z0, 4, {
    pitch: 16, r: 5, at: 0.45,
    height: (i, lt) => (i === 2 ? 10 + 26 * K(lt, t3 + 0.2, 0.6) : 10),
    lit: (i, lt) => (i === 2 ? K(lt, t3 + 0.2, 0.4) : 0),
  });
  S.ruler(-120, 70, z0, 70, { at: 0.5, every: 4, major: 4 });

  // little display housing
  S.block(10, 40, z0, 100, 24, 30, { at: 0.3 });
  S.screen(16, 64, z0 + 5, 88, 20, {
    face: 'y', at: 0.6,
    text: (lt) => (lt < spark ? '压缩  上止点' : lt < pushT ? '{o:点火}' : lt < t3 ? '做功  下行' : '{o:只这步出力}'),
  });
  S.plate(-120, -72, z0, 36, 14, { text: '1缸', at: 0.5 });

  // combustion: one glow, rises on the spark, fades as the piston goes down
  S.glow(-30, 0, headZ - 2, 22, {
    k: (lt) => {
      if (lt < sparkT) return 0;
      const up = Math.min(1, (lt - sparkT) / 0.1);
      const burst = Math.min(1, Math.max(0, (lt - spark) / 0.15));
      const down = Math.exp(-Math.max(0, lt - (pushT + 0.2)) / 0.6);
      return up * (0.75 + 0.25 * burst) * down;
    },
  });

  // one lit part at a time
  plug.lit(P.c(1, 0.2), pushT - 0.2);
  if (cr && cr.lit) cr.lit(pushT - 0.2, t3 + 0.1);
  else if (dial && dial.lit) dial.lit(pushT - 0.2, t3 + 0.1);

  // names
  S.key(1, [-30, 0, headZ + 30], '火花塞', { at: P.cw(1, '火花塞') });
  S.key(2, [-30, 0, headZ - 20], '活塞', { at: P.cw(1, '活塞') });
  S.key(3, [88, 16, z0 + 60], '缸压表', { at: P.cw(2, '膨胀') });
  S.key(4, [-92, 52, z0 + 40], '四冲程 · 第三步做功', { at: t3 + 0.2 });

  // camera: push to the plug, then back to the whole cylinder
  S.view([
    { at: P.c(0, 0.2), focus: [-30, 0, headZ], zoom: 1.75, dur: 0.6 },
    { at: back, zoom: 1, dur: 0.6 },
  ]);

  P.phase([[0, '压缩'], [spark, '点火'], [pushT, '做功'], [t3, '只此出力']]);
  P.readout(pr, { label: '缸压', unit: 'bar', fmt: (v) => v.toFixed(0) });
});
