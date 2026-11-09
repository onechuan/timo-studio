ENGINE.visual('p04', (P) => {
  const LOOK = { hair: 'spiky', hairTone: 'black', outfit: 'school' };
  P.title('即时反馈', { at: 0 });
  const R = P.grid('2x2');
  const t1 = P.c(1), t2 = P.c(2), t3 = P.c(3), t4 = P.c(4), t5 = P.c(5);
  const tFb = P.cw(3, '即时反馈');

  // ── Panel 1 (top right): 小林 props the phone and hits record
  const r0 = R[0];
  const A = P.panel(r0, { at: 0 });
  A.scene('room', { at: 0 });
  const c0 = A.chara(r0.x + r0.w * 0.36, r0.y + 150, 560, {
    ...LOOK, at: 0,
    mood: [[0, 'determined']],
  });
  A.prop('phone', r0.x + r0.w * 0.78, r0.y + r0.h * 0.55, 230, {
    at: 0, label: '● REC', rot: 6,
  });

  // ── Panel 2 (top left): phone close-up, waveform jumping
  const r1 = R[1];
  const B = P.panel(r1, { at: t1, tone: 'light' });
  B.focus(r1.x + r1.w * 0.3, r1.cy, { at: t1, r0: 120, n: 110 });
  B.prop('phone', r1.x + r1.w * 0.28, r1.cy + 10, 300, { at: t1, label: '录音中' });
  const wx0 = r1.x + r1.w * 0.48, wx1 = r1.x + r1.w - 50, wcy = r1.cy + 10;
  B.liveRough((lt, Rr) => {
    if (lt < t1) return [];
    const out = [];
    const n = 16, step = (wx1 - wx0) / n;
    const fr = Math.floor(lt * 10);
    for (let i = 0; i < n; i++) {
      const v = Math.abs(Math.sin(i * 1.7 + fr * 0.9) * Math.cos(i * 0.6 + fr * 1.3));
      const h = 30 + v * 200;
      out.push(Rr.box(wx0 + i * step, wcy - h / 2, step * 0.55, h, { fill: 'ink', color: 'ink' }));
    }
    return out;
  });

  // ── Panel 3 (bottom right): listening, frowning, circling the wrong note
  const r2 = R[2];
  const C = P.panel(r2, { at: t2 });
  C.scene('room', { at: t2 });
  const c2 = C.chara(r2.x + r2.w * 0.3, r2.y + 150, 540, {
    ...LOOK, at: t2,
    mood: [[0, 'angry']],
    emote: [[0, null], [t2 + 0.8, 'sweat']],
  });
  const px = r2.x + r2.w * 0.74, py = r2.cy + 20;
  C.prop('paper', px, py, 280, { at: t2, label: '♪♪♪', rot: -4 });
  C.ring(px + 20, py - 10, 130, 90, { at: t2 + 0.9, dur: 0.5 });
  C.balloon(r2.x + r2.w * 0.56, r2.y + 110, '这里错了', {
    kind: 'think', tail: c2.mouth, at: t2 + 0.5, size: 36,
  });

  // ── Panel 4 (bottom left): the finger plays it right, lines tighten
  const r3 = R[3];
  const D = P.panel(r3, { at: P.c(2, 1.2), tone: 'white' });
  const kx0 = r3.x + 30, kx1 = r3.x + r3.w - 380;
  const ky = r3.y + r3.h * 0.45, kh = r3.h * 0.55 + 20;
  const nk = 7, kw = (kx1 - kx0) / nk;
  const keyX = kx0 + kw * 3, keyCx = keyX + kw / 2;
  D.speedlines({ angle: 90, at: P.c(2, 1.2), dur: t3 - P.c(2, 1.2) + 0.6, n: 50 });
  D.focus(keyCx, ky + kh * 0.4, { at: t3, dur: t4 - t3, r0: 200, n: 120 });
  D.focus(keyCx, ky + kh * 0.4, { at: t4, r0: 90, n: 180 });
  for (let i = 0; i < nk; i++) {
    D.box(kx0 + i * kw, ky, kw, kh, { fill: 'paper', color: 'ink', sw: 4, at: P.c(2, 1.2), dur: 0.3 });
  }
  [0, 1, 3, 4, 5].forEach(i => {
    D.box(kx0 + (i + 1) * kw - kw * 0.3, ky, kw * 0.6, kh * 0.55, { fill: 'ink', color: 'ink', at: P.c(2, 1.3), dur: 0.3 });
  });
  D.tone(keyX + 4, ky + kh * 0.58, kw - 8, kh * 0.42, { kind: 'mid', at: t4 });
  const c3 = D.chara(r3.x + r3.w - 190, r3.y + 140, 460, {
    ...LOOK, at: P.c(2, 1.2), flip: true, look: -0.6,
    mood: [[0, 'determined'], [t5, 'happy']],
    emote: [[0, null], [t5, 'sparkle']],
  });
  D.sfx(keyCx, ky - 40, '咚', { at: t4, size: 150, font: 'brush' });
  P.caption(r3.x + 24, r3.y + 22, '即时反馈', { at: tFb, size: 38, dark: true });

  // camera: a reader's eye
  P.cam([
    P.push(t1 + 0.2, r1.cx, r1.cy, 1.2),
    P.back(t2 - 0.3),
    P.push(tFb, r3.cx, r3.cy, 1.15),
    P.back(t5 + 0.3),
  ]);
});
