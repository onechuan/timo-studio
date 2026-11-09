ENGINE.visual('p02', (P) => {
  P.title('四个冲程');
  P.caption('四缸汽油机 · 第一缸剖视');

  const t1 = P.cw(1, '下行') - 0.3, t2 = P.cw(2, '上行') - 0.3;
  const tBurn = P.cw(3, '燃烧'), t3 = tBurn + 0.15, t4 = P.cw(4, '上来') - 0.3;

  // the page's model: crank angle 0 → 720° (two turns = four strokes)
  const v = P.track([[t1, 180], [t2, 360], [t3, 540], [t4, 720]], { from: 0 });

  const S = P.bench({ azimuth: 35, elevation: 30, box: [150, 176, 1240, 630] });
  const z0 = S.base(-150, -78, 305, 156).z;
  const cz = z0 + 42;

  // crank, flywheel, bearing
  S.block(-9, -50, z0, 18, 12, cz - z0 + 6, { screws: true });
  S.cyl(0, -76, cz, 34, 9, { axis: 'y', holes: 6, spin: (lt) => v(lt), pointer: true });
  S.cyl(0, -67, cz, 6, 30, { axis: 'y' });

  let probe = null, off = 0;
  const C = S.crank(0, 0, cz, {
    r: 22, rod: 72, bore: 30,
    angle: (lt) => (probe !== null ? probe : v(lt) + off),
  });
  // find top dead centre so the head sits right on the stroke
  const topF = C && typeof C.top === 'function' ? C.top
    : C && typeof C.piston === 'function' ? C.piston : null;
  let best = -1e9, aT = 0;
  if (topF) {
    for (let a = 0; a < 360; a += 5) { probe = a; const h = topF(0); if (h > best) { best = h; aT = a; } }
  } else best = cz + 22 + 72 + 30;
  probe = null; off = aT;
  const hz = best + 5, H = 24;

  // cylinder head with valves and spark plug
  const head = S.block(-42, -26, hz, 84, 52, H, { screws: true, groove: true, at: 0.3 });
  const K = (lt, a, d) => PV.K(lt, a, d);
  const io = (lt) => K(lt, P.c(1) - 0.2, 0.3) - K(lt, t2 - 0.2, 0.4);
  const eo = (lt) => K(lt, P.c(4, 0.1), 0.4) - K(lt, P.endT, 0.5);
  const valve = (x, open) => {
    S.spring(x, 0, hz + H, (lt) => 14 - 5 * open(lt), { r: 6, turns: 6, at: 0.5 });
    const stem = S.cyl(x, 0, hz + H - 2, 2.5, 20, { at: 0.5, move: (lt) => [0, 0, -5 * open(lt)] });
    S.cyl(x, 0, hz + H + 14, 7, 3, { at: 0.5, move: (lt) => [0, 0, -5 * open(lt)] });
    return stem;
  };
  const vIn = valve(-20, io);
  const vEx = valve(20, eo);
  const plug = S.cyl(0, 0, hz + H, 4, 20, { at: 0.6, bands: [6, 12] });

  // intake side: air filter + intake pipe (mixture flows in blue)
  S.block(-140, -22, z0, 42, 44, hz + 30 - z0, { slots: 4, groove: true, at: 0.2 });
  S.pipe([[-98, 0, hz + 12], [-42, 0, hz + 12]], { r: 10, at: 0.4, over: true, flow: (lt) => (io(lt) > 0.05 ? 120 : 0) });
  // mixture stream through the open intake valve into the cylinder (intake stroke only)
  S.pipe([[-42, 22, hz + 12], [-20, 22, hz + 12], [-20, 22, hz - 26]], {
    r: 7, at: P.c(1) - 0.2, dur: 0.4, out: t2 - 0.1, over: true, flow: (lt) => (io(lt) > 0.05 ? 120 : 0),
  });

  // exhaust side: exhaust pipe + muffler
  S.block(100, -20, z0, 40, 40, 32, { screws: true, at: 0.2 });
  S.pipe([[42, 0, hz + 12], [120, 0, hz + 12], [120, 0, z0 + 32]], {
    r: 5, at: 0.4, color: 'muted', flow: (lt) => 40 * Math.max(0, eo(lt)),
  });

  // readers and fittings
  S.dial(55, 38, z0, 20, { value: v, min: 0, max: 720, face: 'y', ticks: 36, major: 6, unit: '°', at: 0.3 });
  S.ruler(-140, 62, z0, 280, { every: 5, major: 4, at: 0.3 });
  S.plate(-90, 34, z0, 44, 20, { text: '一缸', at: 0.3 });

  // combustion: the one glow, in the chamber
  S.glow(0, 0, hz + H * 0.5, 46, { k: (lt) => K(lt, tBurn, 0.15) - K(lt, tBurn + 0.5, 1.4) });

  // one lit part at a time, handed on with each stroke
  vIn.lit(P.c(1), P.c(2));
  if (C && typeof C.lit === 'function') C.lit(P.c(2), P.c(3));
  head.lit(P.c(3), P.c(4));
  vEx.lit(P.c(4), P.endT + 1);

  // named as the narration reaches them
  S.key(1, [-20, 0, hz + H + 18], '进气门', { at: P.cw(1, '进气') });
  S.key(2, [0, 15, best - 6], '活塞', { at: P.c(2, 0.3) });
  S.key(3, [-30, 26, hz + 6], '燃烧室', { at: tBurn });
  S.key(4, [20, 0, hz + H + 18], '排气门', { at: P.cw(4, '排气') });
  S.key(5, [0, -76, cz + 40], '曲轴飞轮', { at: P.c(0, 1) });

  P.phase([[0, '待机'], [P.c(1), '进气'], [P.c(2), '压缩'], [P.c(3), '做功'], [P.c(4), '排气']]);
  P.readout(v, { label: '曲轴转角', unit: '°' });
  const stroke = P.track([[P.c(1) - 0.3, 1], [P.c(2) - 0.3, 2], [P.c(3) - 0.3, 3], [P.c(4) - 0.3, 4]], { from: 0 });
  P.value(1480, 420, (lt) => Math.round(stroke(lt)), {
    label: '第几冲程', unit: '/ 4',
  });
});
