// terminal.js — term, gantt, flow; PV.SPIN
ENGINE.visual('p25', (P) => {
  P.title('terminal.js · term / gantt / flow');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.term(120, 260, 760, 340, { at: t0, title: 'zsh', lines: (lt) => ['$ npm test', lt > t1 ? '{g:✓} 12 passed' : PV.SPIN(lt) + ' running', lt > t2 ? '{m:done in 3.2s}' : ''], cursor: () => true });
  P.gantt({ x: 960, y: 300, w: 820, span: 6, tick: 2, at: t0, lanes: [{ label: '下载' }, { label: '解压' }, { label: '安装' }], clock: (lt) => 6 * PV.K(lt, t1, 2.4, 'lin'), bars: [{ lane: 0, a: 0, b: 2.5, label: '下载' }, { lane: 1, a: 2.5, b: 3.5, color: 'orange' }, { lane: 2, a: 3.5, b: 6, color: 'green' }] });
  P.flow([[200, 760], [900, 760], [1600, 820]], [{ t: t1, label: '包' }, { t: t1 + 0.6, label: '包', color: 'orange' }], { dur: 1.6 });
});
