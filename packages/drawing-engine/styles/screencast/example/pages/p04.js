ENGINE.visual('p04', (P) => {
  const A = P.app({ name: '格子本', icon: 'grid', color: 'green', tint: 'sand', sidebar: ['首页', '预算表', '图表', '共享'], toolbar: ['开始', '视图', '格式', '数据'], title: '部门季度预算', doc: '三季度部门预算', date: '9月30日', people: ['林夏', '周航', '陈默'], columns: ['部门', '预算', '实际', '差额'], depts: ['市场部', '销售部', '研发部', '行政部', '人事部', '财务部'] });
  P.desk();
  P.title('条件格式标红');
  const win = P.window({ active: '预算表' });

  // timing
  const tCol = Math.max(1.4, P.cw(0, '差额', 0.1));
  const tFmt = Math.max(tCol + 1.0, P.c(1, -0.3));
  const tCond = Math.max(tFmt + 0.8, P.cw(1, '条件格式', 0.2));
  const tGt = Math.max(tCond + 0.7, P.cw(1, '大于', 0.1));
  const tDlg = tGt + 0.2;
  const tType = Math.max(tDlg + 0.6, P.cw(1, '0', -0.2));
  const tOk = Math.max(tType + 0.9, P.c(2, -0.1));
  const tRed = Math.max(tOk + 0.4, P.cw(2, '变红', -0.3));

  const data = [
    ['市场部', '120000', '135000', '15000'],
    ['销售部', '200000', '186000', '-14000'],
    ['研发部', '300000', '324000', '24000'],
    ['行政部', '80000', '76000', '-4000'],
    ['人事部', '60000', '63000', '3000'],
    ['财务部', '50000', '48000', '-2000'],
  ];
  const t = P.table(win, 48, 48, {
    id: 'sheet', sheet: true, w: 1344,
    rows: [A.columns, ...data],
    select: [{ range: 'D2:D7', at: tCol + 0.15 }],
    mark: [
      { range: 'D2', at: tRed, color: 'red' },
      { range: 'D4', at: tRed + 0.35, color: 'red' },
      { range: 'D6', at: tRed + 0.7, color: 'red' },
    ],
  });

  P.step(3, '**条件格式** 标红', { to: '格式', at: P.c(0, 0.2) });

  P.menu(win, '格式', ['字体', '边框', { label: '条件格式', more: true }, '清除格式'], {
    id: 'fmt', at: tFmt + 0.15, pick: 2, pickAt: tCond, out: tGt + 0.3,
  });
  const sub = P.menu(win, 'fmt.2', ['大于', '小于', '介于', '等于'], {
    id: 'rule', at: tCond + 0.15, pick: 0, pickAt: tGt, out: tGt + 0.3,
  });

  P.dialog(win, {
    title: '大于', text: '差额大于以下值时标红', buttons: ['取消', '确定'],
    at: tDlg, out: tOk + 0.25, press: tOk,
  });
  P.field(win, 520, 330, 400, {
    id: 'val', at: tDlg + 0.1, type: '0', typeAt: tType, cps: 6, blur: tOk, out: tOk + 0.25,
  });

  P.toast(win, '已标红 3 格', { at: tRed + 1.0, out: P.endT + 0.5 });

  P.zoom(t.range('D2:D7'), { at: P.c(3, 0.1), back: Math.min(P.c(3, 2.1), P.endT - 0.6) });

  P.cursor([
    { to: 'sheet:D1', at: tCol, click: true },
    { to: '格式', at: tFmt, click: true, zoom: 1.5, look: 'fmt' },
    { to: sub ? 'fmt.2' : 'fmt.2', at: tCond, click: true },
    { to: 'rule.0', at: tGt, click: true },
    { to: 'val', at: tType - 0.3, click: true },
    { to: '确定', at: tOk, click: true },
    { to: [1500, 760], at: tOk + 1.2 },
  ]);
});
