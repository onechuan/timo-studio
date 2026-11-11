/* p01 Up and down becomes round and round: the bearing posts and the crankshaft settle onto the bench, four pistons on their throws, the flywheel; the crank speeds up as the narration names each part. */
ENGINE.visual('p01', (P) => {
  P.title('活塞与转圈');
  P.caption('四缸汽油发动机 · 剖视');
  const tPiston = P.cw(0, '活塞'), tTurn = P.cw(1, '转圈'), tFly = P.c(2);
  const rpm = P.track([[tPiston - 0.3, 220], [tTurn - 0.3, 800], [P.c(3, -0.3), 850]]);   // the page's model: crank speed
  const ang = (lt) => { let a = 0; for (let t = 0; t < lt; t += 1 / 30) a += rpm(t) * 0.012; return a; };   // crank angle: rpm summed over time
  const S = P.bench({ azimuth: 35, elevation: 42, box: [150, 330, 1180, 500] });
  const z = S.base(-150, -50, 310, 100).z, cz = z + 46;
  [-104, -52, 0, 52, 104].forEach((x, i) => S.block(x - 5, -11, z, 10, 22, 40, { at: 0.1 + i * 0.08 }));
  S.cyl(-122, 0, cz, 5, 262, { axis: 'x', at: 0.4, spin: ang, bands: [26, 78, 130, 182, 234] });
  const cranks = [-78, -26, 26, 78].map((x, i) => S.crank(x, 0, cz, { r: 16, rod: 52, bore: 18, angle: (lt) => ang(lt) + [0, 180, 180, 0][i], at: 0.35 + i * 0.1 }));
  const fly = S.cyl(140, 0, cz, 40, 12, { axis: 'x', at: 0.6, spin: ang, holes: 6, hole: 6, bands: [3, 9] });
  S.ruler(-80, 37, z, 200, { at: 0.5, nums: [0, 20] });
  S.plate(-30, 15, z, 46, 18, { text: '4缸', at: 0.7 });
  S.dial(-140, 34, z, 24, { value: rpm, min: 0, max: 1000, ticks: 40, major: 4, unit: 'rpm', at: 0.8 });
  cranks[0].lit(tPiston, tFly);
  fly.lit(tFly);
  S.key(1, [-78, 0, cz + 78], '活塞 · 上下跑', { at: tPiston });
  S.key(2, [-52, 0, cz], '曲轴 · 转圈', { at: tTurn });
  S.key(3, [146, 0, cz + 40], '飞轮', { at: tFly });
  S.view([{ at: tFly + 0.3, focus: [140, 0, cz], zoom: 1.7, dur: 0.6 }, { at: P.c(3, 0.6), zoom: 1, dur: 0.6 }]);
  P.value(1400, 330, rpm, { unit: 'rpm', label: '曲轴转速' });
  P.phase([[0, '静止'], [tPiston, '活塞上下'], [tTurn, '曲轴转圈'], [tFly, '飞轮旋转']]);
  P.readout(rpm, { label: '转速', unit: 'rpm' });
});
