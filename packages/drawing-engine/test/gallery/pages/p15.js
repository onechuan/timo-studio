// notes.js — memfile, mcard, PV.age
ENGINE.visual('p15', (P) => {
  P.title('notes.js · memfile / mcard / PV.age');
  const t0 = P.c(0), t1 = P.c(1), t2 = P.c(2);
  P.memfile(160, 260, 640, [{ text: '周一：读完第一章' }, { text: '周三：做练习', at: t1 }, { text: '周五：复习', at: t2 }], { at: t0 });
  const c = P.mcard(1000, 300, 420, 260, { at: t0, title: '便签', body: '记得带伞', date: '10/10' });
  P.liveRough((lt, R) => { const a = PV.age(PV.K(lt, t1, 2)); return [R.box(1480, 320, 240, 220, { r: 16, fill: a.fill, color: a.stroke, sw: 3, seed: 4 })]; });
  P.move(c, (lt) => ({ rot: -4 * PV.K(lt, t2, 0.5) }), [1210, 430]);
});
