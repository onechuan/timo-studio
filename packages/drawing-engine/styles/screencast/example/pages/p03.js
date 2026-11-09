ENGINE.visual('p03', (P) => {
  const A = P.app({ name: '格子本', icon: 'grid', color: 'green', tint: 'sand', sidebar: ['首页', '预算表', '图表', '共享'], toolbar: ['开始', '视图', '格式', '数据'], title: '部门季度预算', doc: '三季度部门预算', date: '9月30日', people: ['林夏', '周航', '陈默'], columns: ['部门', '预算', '实际', '差额'], depts: ['市场部', '销售部', '研发部', '行政部', '人事部', '财务部'] });
  P.desk();
  P.title('双击填充柄');
  const win = P.window({ active: '预算表' });

  // timings from the real voice
  const tSel = P.cw(0, '差额', 0.2);          // click first 差额 cell
  const tFx = P.cw(1, '公式');                 // formula shows
  const tHandle = P.cw(2, '小方块');           // cursor onto the fill handle
  const tDbl = P.cw(3, '双击', 0.15);          // double click
  const tFill = tDbl + 0.25;

  const budget = [120, 200, 300, 80, 60, 50];
  const actual = [135, 186, 342, 76, 58, 53];
  const rows = [A.columns.slice()];
  A.depts.forEach((d, i) => {
    rows.push([d, String(budget[i]), String(actual[i]), String(actual[i] - budget[i])]);
  });

  const T = P.table(win, 48, 40, {
    id: 'sheet',
    sheet: true,
    rows,
    formula: { cell: 'D2', text: '=C2-B2', typeAt: tFx, cps: 10 },
    select: [
      { range: 'D2', at: tSel + 0.15 },
      { range: 'D2:D7', at: tFill },
    ],
    reveal: [
      { range: 'D2', at: tFx + 0.75, dur: 0.3 },
      { range: 'D3:D7', at: tFill, dur: 1.4 },
    ],
  });

  P.step(2, '双击**填充柄**', { to: 'sheet:D2', at: P.c(2, 0.1) });

  const r = T.range('D2');
  const handle = [r.x + r.w, r.y + r.h];
  const c2 = T.cell('D2');

  P.cursor([
    { to: [c2[0] - 260, c2[1] + 300], at: 0.4 },
    { to: 'sheet:D2', at: tSel, click: true, zoom: 1.5 },
    { to: handle, at: tHandle },
    { to: handle, at: tDbl, click: 2, back: tDbl + 0.5 },
    { to: [handle[0] + 120, handle[1] + 330], at: Math.min(P.endT - 1, tDbl + 2.2) },
  ]);
});
