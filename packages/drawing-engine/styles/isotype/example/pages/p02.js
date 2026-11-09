ENGINE.visual('p02', (P) => {
  P.title('1980年：孩子多，老人少', { kick: '每100个中国人 · 1980年' });

  // 100 figures, 10 × 10, on the left two thirds
  const A = P.array(null, null, {
    glyph: 'man', n: 100, cols: 20, color: 'ink',
    area: { x: 140, y: 200, w: 1230, h: 640 },
    at: 0.25, land: P.c(0, 1.9),
  });
  const b = typeof A.box === 'function' ? A.box() : A.box;
  const bx = b && b.x != null ? b : { x: 300, y: 200, w: 700, h: 640 };
  const rowH = bx.h / 5;
  const CX = Math.min(1440, bx.x + bx.w + 60);

  // name of the block, under it
  P.caption(bx.x, bx.y + bx.h + 14, '每100人', { size: 36, color: 'soft', at: 0.4 });

  // c1: first 34 turn ochre — children
  const tKid = P.c(1, 0.2);
  A.recolor(tKid, 0, 34, 'orange', { stagger: 0.07 });
  P.caption(CX, bx.y + rowH * 0.2, '孩子 34\n14岁以下', { size: 48, color: 'orange', at: tKid + 34 * 0.07 - 0.2 });

  // c2: last 5 turn red — the old, camera pushes onto them
  const tOld = P.c(2, 0.3);
  A.recolor(tOld, 95, 100, 'red', { stagger: 0.28 });
  P.caption(CX, bx.y + rowH * 4.05, '老人 5\n65岁以上', { size: 48, color: 'red', at: tOld + 5 * 0.28 - 0.1 });

  // c3: the rest dim, the 61 working-age stay black
  const tWork = P.c(3, 0.2);
  A.dim(tWork, { except: [34, 95], op: 0.45 });
  P.caption(CX, bx.y + rowH * 2.1, '15到64岁 61\n干活年纪', { size: 48, color: 'ink', at: tWork + 0.3 });
  A.undim(P.endT - 0.45);

});
