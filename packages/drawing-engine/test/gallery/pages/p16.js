// pipeline.js — pipeline
ENGINE.visual('p16', (P) => {
  P.title('pipeline.js · pipeline');
  const t0 = P.c(0);
  P.pipeline({ x: 360, y: 260, w: 380, at: t0, step: 0.8, ctx: '订单', panel: { x: 1060, y: 300, w: 640, h: 440, title: '结果' },
    segs: [{ name: 'check()', color: 'blue', out: true, frag: '已校验', tok: 12 }, { name: 'coupon()', color: 'purple', out: false }, { name: 'price()', color: 'green', out: true, frag: '¥ 128', tok: 8 }, { name: 'ship()', color: 'orange', out: true, frag: '明天到', tok: 6 }] });
});
