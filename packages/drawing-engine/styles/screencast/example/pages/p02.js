ENGINE.visual('p02', (P) => {
  const A = P.app({ name: '格子本', icon: 'grid', color: 'green', tint: 'sand', sidebar: ['首页', '预算表', '图表', '共享'], toolbar: ['开始', '视图', '格式', '数据'], title: '部门季度预算', doc: '三季度部门预算', date: '9月30日', people: ['林夏', '周航', '陈默'], columns: ['部门', '预算', '实际', '差额'], depts: ['市场部', '销售部', '研发部', '行政部', '人事部', '财务部'] });
  P.desk();
  P.title('第一招：冻结首行');
  const win = P.window({ active: '预算表', toolbar: [{ label: '开始' }, { label: '视图' }, { label: '格式' }, { label: '数据' }] });

  // data: each department, two months → enough rows to scroll
  const budget = [120, 95, 210, 48, 36, 52];
  const actual = [134, 88, 205, 51, 33, 50];
  const data = [];
  ['7月', '8月'].forEach((m, k) => {
    A.depts.forEach((d, i) => {
      const b = budget[i] + k * 6, a = actual[i] + k * (i % 2 ? -3 : 5);
      data.push([d + ' ' + m, String(b), String(a), String(a - b)]);
    });
  });

  const tClickView = P.cw(0, '视图');
  const tPick = P.cw(1, '冻结首行');
  const tScroll = P.cw(2, '往下滚');
  const tPin = P.cw(3, '钉在');

  // scroll frames: data offset per frame
  const offs = [0, 2, 4, 6];
  const frameT = offs.map((o, i) => (i === 0 ? -1 : tScroll + 0.1 + (i - 1) * 0.35));
  const Ls = offs.map(() => P.layer());
  const tables = Ls.map((L, i) => L.table(win, 40, 40, {
    id: 'sheet' + i,
    sheet: true,
    w: 1360,
    cols: [{ w: 400 }, { w: 300 }, { w: 300 }, { w: 300 }],
    rows: [A.columns, ...data.slice(offs[i], offs[i] + 6)],
    freeze: { row: 1, at: i === 0 ? tPick + 0.2 : 0 },
  }));
  P.tick((lt) => {
    let cur = 0;
    frameT.forEach((t, i) => { if (lt >= t) cur = i; });
    Ls.forEach((L, i) => { L.wrap.style.display = i === cur ? '' : 'none'; });
  });

  // step badge + the View menu
  P.step(1, '点 **冻结首行**', { to: '视图', at: P.c(0, 0.3) });
  P.menu(win, '视图', [
    { label: '冻结首行', icon: 'stack' },
    { label: '冻结首列' },
    '-',
    { label: '显示网格线', check: true },
    { label: '缩放' },
  ], { id: 'vmenu', at: tClickView + 0.15, pick: '冻结首行', pickAt: tPick });

  // the header row lights up as it stays pinned
  P.spotlight(tables[3].range('A1:D1'), { at: tPin, out: tPin + 1.5 });

  P.cursor([
    { to: '视图', at: tClickView, click: true, zoom: 1.5, look: 'vmenu' },
    { to: 'vmenu.0', at: tPick, click: true, back: tPick + 1.0 },
    { to: tables[0].cell('B4'), at: tScroll - 0.1 },
    { to: tables[0].cell('B6'), at: tScroll + 1.1 },
    { to: tables[0].cell('C2'), at: tPin + 0.4 },
  ]);
});
