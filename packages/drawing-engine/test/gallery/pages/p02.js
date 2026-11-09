// bots.js — bot, env, jfile, timer
ENGINE.visual('p02', (P) => {
  P.title('bots.js · bot / env / jfile / timer');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  const a = P.bot(360, 420, 110, '组长', { at: t0, color: 'purple' });
  P.bot(360, 720, 110, '助手', { at: t0 + 0.3, color: 'blue' });
  P.move(a, (lt) => ({ x: 30 * PV.K(lt, t2, 0.6) }));
  P.env({ from: [460, 420], to: [1000, 360], t0: t1, dur: 0.9, label: 'task', until: t2 + 1 });
  P.jfile(1080, 260, 560, 360, 'tasks.json', [{ t: t0 + 0.6, text: '{g:"done"}: 2' }, { t: t1 + 0.4, text: '{o:"doing"}: 1' }, { t: t2, text: '{m:"todo"}: 4' }], { at: t0 });
  P.timer(1120, 760, (lt) => PV.mmss(lt * 20), { at: t0 });
});
