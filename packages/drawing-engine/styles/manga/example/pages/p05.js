ENGINE.visual('p05', (P) => {
  P.title('终于顺了', { no: '#05' });
  const R = P.grid('top+2');
  const HERO = { hair: 'spiky', hairTone: 'black', outfit: 'school' };

  // ── Panel 1: hands gliding over the keys ──
  const r0 = R[0];
  const A = P.panel(r0, { at: 0.05, tone: 'white' });
  A.speedlines({ angle: 0, at: 0.05, n: 40 });
  const kTop = r0.y + r0.h * 0.42, kH = r0.h * 0.58 + 10;
  const nK = 30, kW = (r0.w + 40) / nK;
  for (let i = 0; i < nK; i++) {
    A.rect(r0.x - 20 + i * kW, kTop, kW, kH, { fill: 'paper', color: 'ink', sw: 3, at: 0.05, dur: 0.01 });
  }
  for (let i = 0; i < nK; i++) {
    const m = i % 7;
    if (m === 2 || m === 6) continue;
    A.rect(r0.x - 20 + (i + 1) * kW - kW * 0.3, kTop, kW * 0.6, kH * 0.55, { fill: 'ink', color: 'ink', sw: 2, at: 0.05, dur: 0.01 });
  }
  // pressed-key flashes travelling along the keyboard
  const hl = A.layer();
  hl.rect(0, kTop + kH * 0.6, kW, kH * 0.4, { fill: 'faintF', color: 'ink', sw: 2, at: 0.05, dur: 0.01 });
  // two hands, drawn from above
  const handD = (x, y) => `M${x - 70} ${y + 60} C${x - 90} ${y - 10} ${x - 70} ${y - 60} ${x - 50} ${y - 70}
    L${x - 46} ${y - 120} C${x - 44} ${y - 136} ${x - 24} ${y - 136} ${x - 22} ${y - 120} L${x - 18} ${y - 80}
    L${x - 14} ${y - 140} C${x - 12} ${y - 156} ${x + 10} ${y - 156} ${x + 10} ${y - 140} L${x + 12} ${y - 82}
    L${x + 18} ${y - 130} C${x + 20} ${y - 146} ${x + 42} ${y - 146} ${x + 42} ${y - 130} L${x + 40} ${y - 70}
    L${x + 52} ${y - 100} C${x + 58} ${y - 114} ${x + 78} ${y - 108} ${x + 74} ${y - 92} L${x + 64} ${y - 30}
    C${x + 80} ${y + 10} ${x + 80} ${y + 40} ${x + 70} ${y + 60} Z`;
  const H = A.layer();
  const hy = r0.y + r0.h * 0.98;
  H.path(handD(r0.x + r0.w * 0.3, hy), { fill: 'paper', color: 'ink', sw: 5, at: 0.05, dur: 0.01 });
  H.path(handD(r0.x + r0.w * 0.55, hy), { fill: 'paper', color: 'ink', sw: 5, at: 0.05, dur: 0.01 });
  P.tick((lt) => {
    const dx = Math.sin(lt * 1.6) * r0.w * 0.12 + Math.min(lt, 3) * 20;
    H.wrap.style.transform = `translate(${dx}px, ${Math.abs(Math.sin(lt * 9)) * -8}px)`;
    const k = Math.floor(lt * 8) % nK;
    hl.wrap.style.transform = `translate(${r0.x - 20 + ((k * 7) % nK) * kW}px, 0px)`;
  });
  P.caption(r0.x + 30, r0.y + 24, '几天后——', { at: 0.4 });

  // ── Panel 2 (right): the score with the circled two bars ──
  const r1 = R[1];
  const B = P.panel(r1, { at: 1.0, tone: 'light' });
  const sx = r1.x + 40, sy = r1.y + 40, sw = r1.w - 80, sh = r1.h - 80;
  B.rect(sx, sy, sw, sh, { fill: 'paper', color: 'ink', sw: 4, at: 1.0, dur: 0.01 });
  const rows = [sy + sh * 0.28, sy + sh * 0.68];
  rows.forEach((y0, ri) => {
    for (let l = 0; l < 5; l++) B.line(sx + 30, y0 + l * 14, sx + sw - 30, y0 + l * 14, { color: 'ink', sw: 2, at: 1.0, dur: 0.01 });
    for (let b = 0; b <= 4; b++) {
      const bx = sx + 30 + b * (sw - 60) / 4;
      B.line(bx, y0, bx, y0 + 56, { color: 'ink', sw: 3, at: 1.0, dur: 0.01 });
    }
    for (let n = 0; n < 16; n++) {
      const nx = sx + 50 + n * (sw - 90) / 16;
      const ny = y0 + 56 - ((n * 5 + ri * 3) % 9) * 7;
      B.ellipse(nx, ny, 18, 13, { fill: 'ink', color: 'ink', sw: 2, at: 1.0, dur: 0.01 });
      B.line(nx + 9, ny, nx + 9, ny - 46, { color: 'ink', sw: 2, at: 1.0, dur: 0.01 });
    }
  });
  // the pencil circle around two bars of the second row (already there from before)
  const cx2 = sx + 30 + (sw - 60) * 0.5, cy2 = rows[1] + 28;
  B.ring(cx2, cy2, (sw - 60) * 0.56, 150, { color: 'soft', at: 1.0, dur: 0.3 });
  B.check(cx2 - (sw - 60) * 0.12, rows[1] - 40, 110, { color: 'ink', sw: 8, at: P.cw(1, '刻意练习'), dur: 0.35 });
  B.text('刻意练习', { x: sx + 40, y: sy + 20, size: 46, color: 'ink', at: P.cw(1, '刻意练习', 0.2), cps: 10, weight: 700 });
  P.sfx(r1.x + r1.w - 150, r1.y + r1.h * 0.5, 'ドン', { size: 150, at: P.cw(1, '刻意练习', 0.35) });
  // c3: the next page's hard passage is turned to
  B.prop('paper', r1.x + r1.w * 0.42, r1.y + r1.h - 130, 240, { label: '下一页', rot: -8, at: P.c(3, 0.4) });

  // ── Panel 3 (left): Xiaolin looks up and smiles ──
  const r2 = R[2];
  const C = P.panel(r2, { at: P.c(2, -0.15), tone: 'white' });
  C.scene('sparkle', { at: P.c(2, -0.15) });
  const ch = C.chara(r2.cx, r2.y + r2.h * 0.4, Math.min(700, r2.h * 1.35), {
    ...HERO,
    at: P.c(2, -0.15),
    mood: [[0, 'happy'], [P.c(3), 'determined']],
    emote: [[0, 'sparkle'], [P.c(3), 'exclaim']],
    look: [[0, 0], [P.c(3), 0.6]],
  });
  P.caption(r2.x + 24, r2.y + r2.h - 110, '先别从头再来。', { at: P.cw(3, '先别', -0.1), size: 36 });

  P.cam([
    P.push(P.cw(1, '刻意练习', -0.2), r1.cx, r1.cy, 1.2),
    P.back(P.c(2, -0.1)),
  ]);
});
