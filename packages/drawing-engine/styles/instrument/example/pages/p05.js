ENGINE.visual('p05', (P) => {
  P.title('正时皮带');
  P.caption('四缸汽油机 · 正时皮带');

  const S = P.bench({ azimuth: 35, box: [150, 176, 1250, 630] });
  const z0 = S.base(-130, -70, 260, 140).z;

  // ---- model: crank turns (cam turns = half) ----
  const t0 = P.c(1, 0.5), t1 = P.c(3, 2.3);
  const v = (lt) => {
    const u = Math.max(0, Math.min(1, (lt - t0) / (t1 - t0)));
    return 2 * (u * u * (3 - 2 * u));
  };
  const crankDeg = (lt) => v(lt) * 360;
  const camDeg = (lt) => v(lt) * 180;

  // ---- geometry ----
  const zc = z0 + 34;            // crank axis
  const zh = zc + 99;            // cylinder head bottom
  const zcam = zh + 36;          // camshaft axis
  const BY = 35;                 // belt plane

  // structure
  S.block(-40, -40, z0, 80, 8, zh - z0, { at: 0 });                 // back wall of the block
  S.block(-8, -26, z0, 16, 8, zc - z0, { at: 0.1 });                // rear main bearing
  S.block(-8, 18, z0, 16, 8, zc - z0, { at: 0.15 });                // front main bearing
  S.cyl(0, -26, zc, 4, 58, { axis: 'y', at: 0.2 });                  // main shaft / nose
  const crank = S.crank(0, 0, zc, { r: 18, rod: 55, bore: 14, angle: crankDeg, at: 0.2 });
  const head = S.block(-40, -40, zh, 80, 70, 20, { at: 0.3, groove: true, screws: true });

  // reader housing + dial + plate on the base
  S.block(55, -20, z0, 60, 45, 40, { at: 0.4, slots: 4 });
  S.dial(-100, 5, z0, 22, { value: v, min: 0, max: 2, ticks: 8, major: 4, unit: '圈', at: 0.5 });
  S.plate(-118, 40, z0, 50, 18, { text: '1.6L', at: 0.6 });

  // valves: tappets + springs, pushed by cam noses
  const lift = (phase) => (lt) => {
    const f = (camDeg(lt) + phase) * Math.PI / 180;
    return Math.max(0, -4 - 9 * Math.cos(f));
  };
  const valves = [
    { y: -20, phase: -72 },   // intake: opens at 0.7 cam turn
    { y: -2, phase: 72 },     // exhaust: opens at 0.3 cam turn
  ];
  const tappets = valves.map((vv, i) => {
    const L = lift(vv.phase);
    S.spring(0, vv.y, zh + 20, (lt) => 9 - L(lt), { r: 8, turns: 5, at: P.c(0, 0.1 + i * 0.15) });
    return S.cyl(0, vv.y, zh + 20, 6, 9, { at: P.c(0, 0.1 + i * 0.15), move: (lt) => [0, 0, -L(lt)], cap: true });
  });

  // camshaft on its bearings
  const camAt = P.c(0, 1.4);
  S.block(-8, -38, zh + 20, 16, 6, 16, { at: camAt - 0.2 });
  S.block(-8, 8, zh + 20, 16, 6, 16, { at: camAt - 0.2 });
  const camshaft = S.cyl(0, -38, zcam, 5, 70, { axis: 'y', at: camAt, spin: camDeg, bands: [8, 26, 46] });
  valves.forEach((vv) => {
    S.cyl(0, vv.y - 3, zcam, 7, 6, { axis: 'y', at: camAt + 0.1 });   // base circle
    S.cyl(0, vv.y - 3, zcam, 3.5, 6, {
      axis: 'y', at: camAt + 0.1,
      move: (lt) => { const f = (camDeg(lt) + vv.phase) * Math.PI / 180; return [9 * Math.sin(f), 0, 9 * Math.cos(f)]; },
    });
  });

  // pulleys + timing belt
  const crankPulley = S.cyl(0, 32, zc, 16, 6, { axis: 'y', at: P.c(1, 0), spin: crankDeg, pointer: true });
  const camPulley = S.cyl(0, 32, zcam, 32, 6, { axis: 'y', at: P.c(1, 0), spin: camDeg, pointer: true, holes: 4, hole: 5 });
  S.belt([0, BY, zc, 16], [0, BY, zcam, 32], { w: 6, run: (lt) => crankDeg(lt) * Math.PI / 180 * 16, at: P.c(1, 0.3) });

  // what the machine shows
  S.screen(60, 25, z0 + 8, 50, 26, {
    face: 'y', at: P.c(2, 0.8),
    text: (lt) => {
      const ct = v(lt) / 2;
      const nIn = ct >= 0.7 ? 1 : 0, nEx = ct >= 0.3 ? 1 : 0;
      return `带轮比 {o:2 : 1}\n进气门 ${nIn} 次\n排气门 ${nEx} 次`;
    },
  });

  // naming
  S.key(1, [0, -20, zh + 30], '气门', { at: P.c(0, 0.1) });
  S.key(2, [0, -38, zcam + 6], '凸轮轴', { at: P.c(0, 1.6) });
  S.key(3, [16, BY, (zc + zcam) / 2], '正时皮带', { at: P.c(1, 0.3) });
  S.key(4, [0, BY + 6, zc - 18], '曲轴带轮', { at: P.c(1, 1.1) });
  S.key(5, [0, BY + 6, zcam + 34], '凸轮轴大带轮', { at: P.c(2, 0.5) });

  // the light, handed on
  camshaft.lit(P.c(0, 1.6), P.c(1, 1.0));
  crankPulley.lit(P.c(1, 1.1), P.c(2, 0.4));
  camPulley.lit(P.c(2, 0.4), P.c(3, 1.0));
  tappets[0].lit(P.c(3, 1.0), P.endT + 1);

  // camera: push on the two pulleys, then back
  S.view([
    { at: P.c(2, 0.2), focus: [0, BY, (zc + zcam) / 2 - 20], zoom: 1.25 },
    { at: P.c(3, -0.2), zoom: 1 },
  ]);

  // readings
  const fmt = (x) => x.toFixed(2);
  P.value(1470, 400, (lt) => v(lt) / 2, { unit: '圈', label: '凸轮轴转数', fmt });
  P.phase([[0, '静止'], [P.c(1, 0.4), '皮带传动'], [P.c(2, 0.3), '减速 2 : 1'], [P.c(3, 1.0), '气门开启']]);
  P.readout(v, { label: '曲轴', unit: '圈', fmt });
});
