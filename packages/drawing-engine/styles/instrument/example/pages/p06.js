ENGINE.visual('p06', (P) => {
  P.title('四缸轮流出力');
  P.caption('四缸汽油发动机 · 点火顺序 1-3-4-2');

  // ---- the model: crank angle (runs, then coasts to rest at the end) ----
  const W = 240;                       // deg per second on screen (slow motion)
  const D = 1.6;                       // coast-down time
  const tS = P.endT - 1.8;             // start of coast-down
  const ang = (lt) => {
    if (lt < tS) return W * Math.max(0, lt);
    const u = Math.min(lt - tS, D);
    return W * tS + W * (u - (u * u) / (2 * D));
  };
  const wf = (lt) => (lt < tS ? 1 : Math.max(0, 1 - (lt - tS) / D));
  const rpm = (lt) => 2000 * wf(lt);
  const total = W * tS + (W * D) / 2;
  const tOf = (a) => (a <= W * tS ? a / W : tS + D * (1 - Math.sqrt(Math.max(0, 1 - (2 * (a - W * tS)) / (W * D)))));

  // firing order 1-3-4-2: one cylinder every half turn
  const ORDER = [0, 2, 3, 1];
  const fires = [];
  for (let n = 0; 180 * n < total - 1; n++) fires.push({ t: tOf(180 * n), c: ORDER[n % 4] });
  const fireCount = (lt) => fires.filter((f) => f.t <= lt).length;

  const S = P.bench({ azimuth: 35, elevation: 42, box: [150, 176, 1300, 630] });

  // ---- base and structure ----
  const zb = S.base(-50, 0, 340, 140).z;
  const zc = zb + 36;                  // crankshaft axis height
  const CX = [70, 108, 146, 184];      // cylinder centres
  const CY = 70;
  const PH = [0, 180, 180, 0];         // crank throws: 1 & 4 together, 2 & 3 opposite

  S.block(50, 34, zb, 160, 8, 120, { at: 0.1, slots: 0, groove: false });   // crankcase back wall
  [46, 89, 127, 165, 206].forEach((x, i) =>
    S.block(x - 3, CY - 10, zb, 6, 20, 31, { at: 0.15 + i * 0.05 }));      // main bearing posts
  S.cyl(24, CY, zc, 5, 210, { axis: 'x', back: true, at: 0.3 });            // main journal shaft

  // ---- the four cranks, rods and pistons ----
  const cr = CX.map((x, i) =>
    S.crank(x, CY, zc, { r: 18, rod: 55, bore: 14, angle: (lt) => ang(lt) + PH[i], at: 0.35 + i * 0.08 }));

  let zTop = zc + 18 + 55 + 10;
  try { const v = cr[0].top(0); if (typeof v === 'number' && isFinite(v)) zTop = v; } catch (e) {}
  const zHead = zTop + 6;

  // cylinder head, cam cover, spark plugs
  S.block(52, 52, zHead, 150, 36, 14, { at: 0.5, screws: true });
  S.block(56, 56, zHead + 14, 142, 28, 8, { at: 0.6, groove: true });
  CX.forEach((x, i) => S.cyl(x, CY, zHead + 22, 3, 12, { bands: [4], at: 0.7 + i * 0.05 }));

  // timing belt: crank pulley -> cam pulley (2 : 1)
  const zCam = zHead + 10;
  S.cyl(24, CY + 22, zc, 9, 8, { axis: 'y', spin: (lt) => ang(lt), pointer: true, at: 0.5 });
  S.cyl(32, CY + 22, zCam, 18, 8, { axis: 'y', spin: (lt) => ang(lt) / 2, pointer: true, at: 0.55 });
  S.belt([24, CY + 26, zc, 9], [32, CY + 26, zCam, 18], { run: (lt) => (ang(lt) * Math.PI / 180) * 9, at: 0.6 });

  // flywheel at the back end of the crankshaft
  S.cyl(222, CY, zc, 34, 12, { axis: 'x', holes: 6, spin: (lt) => ang(lt), at: 0.45 });

  // tachometer and firing-order plate
  S.dial(-22, 22, zb, 24, { value: rpm, min: 0, max: 6000, face: 'y', ticks: 30, major: 5, nums: false, at: 0.4 });
  S.plate(236, 108, zb, 44, 22, { text: '1-3-4-2', at: 0.5 });

  // ---- combustion: one flash per half turn, handed from cylinder to cylinder ----
  CX.forEach((x, c) => {
    const mine = fires.filter((f) => f.c === c).map((f) => f.t);
    S.glow(x, CY, zTop + 3, 12, {
      k: (lt) => {
        let k = 0;
        for (const t of mine) {
          const d = lt - t;
          if (d >= 0 && d < 0.6) k = Math.max(k, Math.min(1, d / 0.08) * Math.max(0, 1 - (d - 0.08) / 0.5));
        }
        return k;
      },
    });
  });
  fires.forEach((f, i) => {
    const until = i + 1 < fires.length ? fires[i + 1].t : P.endT + 5;
    cr[f.c].lit(f.t, until);
  });

  // ---- naming ----
  S.key(1, [CX[0], CY + 14, zc + 50], '活塞 · 气缸', { at: P.cw(0, '气缸') });
  S.key(2, [CX[2], CY, zHead + 34], '火花塞', { at: P.cw(0, '做功') });
  S.key(3, [CX[1], CY + 8, zc], '曲轴', { at: P.cw(1, '曲轴') });
  S.key(4, [228, CY, zc + 36], '飞轮', { at: P.cw(2, '稳') });
  S.key(5, [32, CY + 30, zCam + 18], '正时皮带', { at: P.cw(3, '油门') });

  // ---- readings ----
  P.value(1500, 330, fireCount, { unit: '次', label: '做功次数 · 半圈一次', at: P.c(1) });
  P.phase([[0, '轮流做功'], [P.c(1), '半圈一次'], [P.c(2), '平稳运转'], [tS, '停转'], [tS + D, '静止']]);
  P.readout(rpm, { label: '转速', unit: 'rpm' });
});
