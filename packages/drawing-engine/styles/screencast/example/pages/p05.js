ENGINE.visual('p05', (P) => {
  const A = P.app({ name: '格子本', icon: 'grid', color: 'green', tint: 'sand', sidebar: ['首页', '预算表', '图表', '共享'], toolbar: ['开始', '视图', '格式', '数据'], title: '部门季度预算', doc: '三季度部门预算', date: '9月30日', people: ['林夏', '周航', '陈默'], columns: ['部门', '预算', '实际', '差额'], depts: ['市场部', '销售部', '研发部', '行政部', '人事部', '财务部'] });
  P.desk();
  P.title('同一张表，一眼看完');
  const win = P.window({ active: '预算表', title: A.doc });

  const D = A.depts;
  const tRed = P.cw(2, '红格子');
  const tSave = P.c(3, 0.7);

  const t = P.table(win, 40, 40, {
    id: 'tbl', sheet: true, w: 1060,
    rows: [
      A.columns,
      [D[0], '120,000', '134,500', '-14,500'],
      [D[1], '200,000', '186,200', '13,800'],
      [D[2], '310,000', '326,800', '-16,800'],
      [D[3], '45,000', '41,300', '3,700'],
      [D[4], '38,000', '35,900', '2,100'],
      [D[5], '52,000', '49,600', '2,400'],
    ],
    freeze: { row: 1, at: 0 },
    mark: [
      { range: 'D2', at: 0, color: 'red' },
      { range: 'D4', at: 0, color: 'red' },
    ],
    select: [
      { range: 'D2:D7', at: P.cw(1, '差额', 0.2) },
      { range: 'A2:D2', at: tRed + 0.15 },
    ],
  });

  // 右侧：保存按钮 + 超预算小结
  P.button(win, 1400, 40, '保存', { align: 'r', press: tSave, then: '已保存', icon: 'check', variant: 'done', at: tSave + 0.15 });
  P.panel(win, 1130, 150, 270, 230, {
    kind: 'card', title: '超预算', text: `${D[0]}\n${D[2]}`, chip: '{r:2}',
    at: P.cw(2, '超预算'),
  });

  P.spotlight(t.range('D1:D7'), { at: P.cw(1, '差额'), out: P.cw(1, '差额') + 1.6 });

  P.toast(win, '已保存', { at: tSave + 0.2, icon: 'check' });

  P.cursor([
    { to: t.cell('B4'), at: 0.9 },
    { to: t.cell('B7'), at: P.cw(0, '往下滚') },
    { to: t.cell('C3'), at: P.cw(1, '表头') },
    { to: t.cell('D6'), at: P.cw(1, '全有数') },
    { to: 'tbl:A2', at: tRed, click: true, zoom: 1.5 },
    { to: '保存', at: tSave, click: true },
  ], { back: tSave + 0.6 });
});
