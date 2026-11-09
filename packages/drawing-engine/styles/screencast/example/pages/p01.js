ENGINE.visual('p01', (P) => {
  const A = P.app({ name: '格子本', icon: 'grid', color: 'green', tint: 'sand', sidebar: ['首页', '预算表', '图表', '共享'], toolbar: ['开始', '视图', '格式', '数据'], title: '部门季度预算', doc: '三季度部门预算', date: '9月30日', people: ['林夏', '周航', '陈默'], columns: ['部门', '预算', '实际', '差额'], depts: ['市场部', '销售部', '研发部', '行政部', '人事部', '财务部'] });
  P.desk();
  P.title('预算表的三件麻烦事');
  const win = P.window({ active: '预算表', rise: true });
  const B = win.body;

  // scrollable sheet: outer layer clips to the body, inner layer scrolls
  const O = P.layer();
  O.wrap.style.clipPath = `polygon(${B.x}px ${B.y}px, ${B.x + B.w}px ${B.y}px, ${B.x + B.w}px ${B.y + B.h}px, ${B.x}px ${B.y + B.h}px)`;
  const L = O.layer();

  const budget = ['120,000', '200,000', '300,000', '80,000', '60,000', '90,000'];
  const actual = ['135,600', '186,400', '322,000', '79,200', '58,500', '97,300'];
  const rows = [A.columns.map(c => `**${c}**`)];
  A.depts.forEach((d, i) => rows.push([d, budget[i], actual[i], i === 0 ? '-15,600' : '']));

  const tStart = P.cw(3, '花超了') - 0.3;
  const span = (P.endT - 0.1 - tStart) / 5;
  const rowT = [0, 1, 2, 3, 4].map(k => tStart + k * span);

  const sheet = L.table(win, 48, 48, {
    sheet: true,
    w: 1344,
    rows,
    select: [
      { range: 'D2', at: P.cw(2, '差额') + 0.1 },
      ...rowT.map((t, k) => ({ range: `C${k + 2}`, at: t + 0.1 })),
    ],
    mark: [{ range: 'D3:D7', at: P.cw(2, '第一行') + 0.2, color: 'orange' }],
  });

  // wheel scroll: the header row slides out of the window, then back
  const sDown = P.cw(1, '滚'), sBack = P.c(2) - 0.75;
  P.tick(lt => {
    const k = PV.K(lt, sDown, 0.7, PV.ease.out) - PV.K(lt, sBack, 0.6, PV.ease.inOut);
    L.wrap.style.transform = `translateY(${-170 * k}px)`;
  });

  P.spotlight(sheet.range('D1:D7'), { at: P.cw(2, '差额') + 0.3, out: P.cw(2, '公式') + 0.6 });

  const mid = [B.x + 700, B.y + 380];
  P.cursor([
    { to: [B.x + 560, B.y + 420], at: 1.3 },
    { to: mid, at: sDown - 0.15 },
    { to: [mid[0] + 10, mid[1] + 6], at: sBack - 0.1 },
    { to: sheet.cell('D2'), at: P.cw(2, '差额'), click: true, zoom: 1.5 },
    { to: sheet.cell('D4'), at: P.cw(2, '第一行') + 0.2 },
    ...rowT.map((t, k) => ({ to: sheet.cell(`C${k + 2}`), at: t, ...(k === rowT.length - 1 ? { back: Math.min(t + 0.8, P.endT - 1.2) } : {}) })),
  ]);
});
