/* p01 One parcel's journey: the warehouse rises, parcels ride the belt to sorting, trucks drive to town, a courier walks the last stretch. */
ENGINE.visual('p01', (P) => {
  P.title('从仓库到你家门口', { accent: 'orange' });
  const S = P.iso({ x: 960, y: 560, unit: 68, grid: [12, 9] });
  S.tile(0, 0, 4.6, 4.2, { color: 'lilac', at: 0 });
  S.block(0.4, 0.4, 3.2, 2.6, 2.2, { color: 'lilac', windows: { rows: 2, lit: 0.1 }, stripe: 'purple', door: true, at: 0.1 });
  S.cyl(4.1, 0.8, 0.45, 1.6, { color: 'sky', bands: 2, at: 0.4 });
  S.label(0.4, 1.7, 2.2, '仓库', { at: P.cw(0, '仓库'), color: 'purple', sub: 'WAREHOUSE', dx: -170, dy: 10 });
  S.belt([[3.6, 2.4], [6.6, 2.4], [6.6, 4.2]], { at: P.c(1) });
  S.flow([[3.6, 2.4], [6.6, 2.4], [6.6, 4.2]], { at: P.c(1) + 0.4, z: 0.25, count: 6, speed: 1.6 });
  S.block(5.4, 4.4, 2.6, 2.2, 1.5, { color: 'sky', windows: { rows: 1 }, stripe: 'blue', at: P.cw(1, '分拣中心') - 0.3 });
  S.label(6.7, 5.5, 1.5, '分拣中心', { at: P.cw(1, '分拣中心'), color: 'blue', dx: -60 });
  S.path([[8.2, 7.2], [10.8, 7.2], [10.8, 3.2]], { at: P.c(2) - 0.3, dur: 1, width: 0.9, color: 'faint', arrow: false });
  S.flow([[8.2, 7.2], [10.8, 7.2], [10.8, 3.2]], { at: P.c(2), kind: 'truck', color: 'orange', count: 2, speed: 1.5 });
  [[9, 0.3, 2.4], [10.2, 0.3, 3.2], [11.2, 1.4, 1.8], [8.8, 1.8, 1.2]].forEach(([x, y, hh], i) => S.block(x, y, 1, 1, hh, { color: ['white', 'peach', 'white', 'mint'][i], windows: true, at: P.c(2) + 0.4 + i * 0.15 }));
  S.block(11.1, 4.4, 0.9, 0.9, 0.9, { color: 'butter', door: 'orange', at: P.c(3) - 0.4 });
  S.flow([[10.8, 3.4], [11.4, 3.6], [11.5, 4.3]], { at: P.c(3), once: true, dur: 1.6, kind: 'person', color: 'orange' });
  S.label(11.5, 4.8, 0.9, '你家', { at: P.cw(3, '你家门口'), color: 'orange', sub: 'LAST 1 KM', dy: -100 });
  [[0.3, 6.4], [1.2, 7.4], [2.6, 8.3], [4.2, 8.4], [7.9, 0.4], [11.6, 8.2]].forEach(([x, y], i) => S.tree(x, y, { at: 0.3 + i * 0.08 }));
  [[1.8, 5.2], [2.4, 5.8], [3.4, 5.4]].forEach(([x, y], i) => S.person(x, y, { color: ['blue', 'purple', 'green'][i], at: 0.6 + i * 0.1 }));
  P.cam([P.push(P.c(1), 820, 520, 1.12), P.back(P.c(2)), P.push(P.c(3), 1240, 560, 1.15)]);
});
