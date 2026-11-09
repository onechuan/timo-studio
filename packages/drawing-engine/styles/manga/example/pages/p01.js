ENGINE.visual('p01', (P) => {
  P.title('第一百遍', { no: '#01' });
  const HERO = { hair: 'spiky', hairTone: 'black', outfit: 'school' };
  const R = P.grid('2x2');
  const t100 = Math.min(P.cw(0, '100遍'), 1.8), tKnot = P.cw(1, '打结'), t4 = Math.min(tKnot + 0.4, 4.4);
  const A = P.panel(R[0], { at: 0 }), a = A.area;                      // ① 深夜，琴前的小林
  A.scene('room', { at: 0 }); A.prop('book', a.x + 190, a.y + a.h * 0.42, 230, { at: 0 });
  A.chara(a.x + a.w * 0.64, a.y + a.h * 0.36, 560, { ...HERO, at: 0, look: -0.7, mood: [[0, 'determined'], [tKnot, 'shock']] });
  A.box(a.x - 20, a.y + a.h - 64, a.w + 40, 90, { fill: 'paper', color: 'ink', sw: 4, at: 0, dur: 0.3 });   // 琴键
  for (let i = 0; i < 16; i++) {
    const kx = a.x + i * (a.w / 16);
    A.line(kx, a.y + a.h - 64, kx, a.y + a.h + 20, { color: 'ink', sw: 3, at: 0, dur: 0.2 });
    if (i % 7 !== 2 && i % 7 !== 6) A.box(kx + a.w / 16 - 12, a.y + a.h - 64, 24, 44, { fill: 'ink', color: 'ink', sw: 2, at: 0, dur: 0.2 });
  }
  P.caption(a.x + 20, a.y + 20, '深夜，琴房。', { at: 0.5, size: 34 });
  const B = P.panel(R[1], { at: t100, tone: 'light' }), b = B.area;     // ② 谱角的正字：第100遍
  B.focus(b.x + b.w * 0.62, b.cy, { at: t100, r0: 150, n: 110 });
  B.prop('paper', b.x + b.w * 0.62, b.cy - 20, 340, { label: '100', at: t100, rot: -4 });
  B.text('**第100遍**', { x: b.x + 40, y: b.y + b.h - 90, size: 52, color: 'ink', at: t100 + 0.2, cps: 12 });
  B.text('正正正正\n正正正正\n正正正…', { x: b.x + 40, y: b.y + 50, size: 40, color: 'ink', at: t100, cps: 14, lh: 1.25 });
  const C = P.panel(R[2], { at: P.c(1), tone: 'speed' }), c = C.area;   // ③ 手指打结：冷汗
  C.focus(c.cx, c.y + c.h * 0.42, { at: tKnot, r0: 170 });
  C.chara(c.cx + 60, c.y + c.h * 0.42, 600, { ...HERO, at: P.c(1), mood: [[0, 'determined'], [tKnot, 'shock']], emote: [[0, null], [tKnot, 'sweat']] });
  P.sfx(c.x + 170, c.y + 120, 'ガーン', { at: tKnot, size: 170 });
  const D = P.panel(R[3], { at: t4 }), d = D.area;                       // ④ 眼睛特写：为什么没用？
  D.scene('dark', { at: t4 }); D.eyes(d.cx, d.y + d.h * 0.38, d.w * 0.95, { ...HERO, at: t4, mood: [[0, 'shock'], [P.c(2), 'despair']] });
  D.balloon(d.cx, d.y + d.h - 70, '为什么没用？', { kind: 'think', vertical: false, size: 40, at: P.c(2, 0.3), tail: [d.cx, d.y + d.h * 0.5] });
  P.cam([P.push(t100 + 0.1, b.cx, b.cy, 1.2), P.back(P.c(1, -0.1))]);
});
