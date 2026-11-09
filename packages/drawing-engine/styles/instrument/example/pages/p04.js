ENGINE.visual('p04', (P) => {
  P.title('曲轴：上下变转圈');
  P.caption('四缸汽油机 · 曲轴与一缸');

  // the model: crankshaft angle in degrees (total)
  const t1 = P.c(1, 0.2), d1 = 2.2;
  const t2 = P.c(2) - 0.3, d2 = 1.0;
  const t3 = P.c(3, 0.1), d3 = Math.max(1.5, P.endT - P.c(3) - 0.4);
  const ang = (lt) =>
    90 * PV.K(lt, t1, d1) + 90 * PV.K(lt, t2, d2) + 540 * PV.K(lt, t3, d3);
  const turns = (lt) => Math.floor(ang(lt) / 360 + 1e-6);

  const S = P.bench({ azimuth: 38, elevation: 34, box: [150, 176, 1180, 630] });
  const z0 = S.base(-130, -80, 260, 160, { h: 10 }).z;
  const zc = z0 + 46; // crankshaft centre height

  // structure: main bearings and the crankshaft running along y
  const bh = zc - z0 + 8;
  S.block(-14, -62, z0, 28, 12, bh, { screws: true });
  S.block(-14, 36, z0, 28, 12, bh, { screws: true });
  const shaft = S.cyl(0, -76, zc, 6, 140, { axis: 'y', spin: ang, bands: [16, 112] });
  // timing pulley at the rear end
  S.cyl(0, -86, zc, 16, 10, { axis: 'y', spin: ang, knurl: 18 });

  // the crank throw, connecting rod and piston in its cut-open cylinder
  const crank = S.crank(0, -12, zc, {
    r: 22, rod: 72, bore: 34, angle: ang, at: P.cw(0, '连杆') - 0.3,
  });

  // angle disc (flywheel) at the front end of the crankshaft
  const disc = S.cyl(0, 64, zc, 34, 8, {
    axis: 'y', spin: ang, holes: 6, pointer: true, bands: [4], at: 0.2,
  });

  // dial gauge on a post, reading the crank angle
  const zp = S.block(70, 20, z0, 40, 30, 34, { groove: true, at: 0.3 }).z;
  S.dial(90, 34, zp, 26, {
    value: (lt) => ang(lt) % 360, min: 0, max: 360, sweep: 360,
    ticks: 36, major: 9, face: 'y', at: P.c(2) - 0.4,
  });
  S.screen(74, 50, z0 + 6, 32, 20, {
    face: 'y', text: (lt) => Math.round(ang(lt) % 360) + '度', at: P.c(2) - 0.2,
  });

  // fittings: plate, knob, ruler, oil line to the bearings
  S.plate(-118, -60, z0, 46, 24, { text: '曲轴' });
  S.cyl(-100, 50, z0, 7, 12, { knurl: 12 });
  S.ruler(-120, 70, z0, 90, { every: 5, major: 4 });
  S.pipe([[-60, 42, z0 + 4], [-30, 42, z0 + 4], [-14, 42, z0 + 20]], {
    r: 2.5, flow: (lt) => (lt > P.c(1) ? 1 : 0), at: 0.5,
  });

  // lights: throw while pushed, disc while reading half a turn
  shaft.lit(P.c(1), P.c(2));
  disc.lit(P.c(2), P.c(3));

  // names
  S.key(1, [0, -12, zc + 60], '连杆', { at: P.cw(0, '连杆') });
  S.key(2, [0, -12, zc + 130], '活塞', { at: P.c(0, 0.6) });
  S.key(3, [0, -40, zc], '曲拐 · 主轴', { at: P.c(1, 0.4) });
  S.key(4, [0, 72, zc + 34], '角度刻盘', { at: P.c(2, 0.3) });

  // camera: push to the throw, back for the two turns
  S.view([
    { at: P.c(1, 0.3), focus: [20, 18, zc + 12], zoom: 1.2 },
    { at: P.c(3), zoom: 1 },
  ]);

  P.value(1440, 420, turns, { unit: '圈', label: '曲轴圈数' });
  P.phase([[0, '装配'], [P.c(1), '推动曲拐'], [P.c(2), '一冲程 半圈'], [P.c(3), '四冲程 两圈']]);
  P.readout((lt) => ang(lt), { label: '曲轴转角', unit: '°' });
});
