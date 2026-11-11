/* p01 A seascape prints itself back to front — sky, sun, the snow-capped peak, mist bands, the rolling sea; a boat crosses; on "拍水而起" the great wave rises and curls; cartouches 一击三千里 / 九万里; the seal 鹏 lands on the question. */
ENGINE.visual('p01', (P) => {
  P.title('北冥有鱼');
  const t1 = P.c(1), t2 = P.c(2), t3 = P.c(3), t4 = P.c(4);
  // the print builds back to front: sky, sun, far peak, mist, sea
  P.sky({ color: 'blue', to: 0.55, horizon: 'redF', hy: 640 });
  P.sun(420, 300, 92, { at: 0.6 });
  P.peak(1080, 660, 760, 330, { at: 0.9, dur: 1.6 });
  P.kasumi({ y: 560, bands: 3, at: 1.6 });
  P.waves({ y0: 650, at: 0.4 });
  // the boat rides the swell all page long
  P.boat((lt) => ({ x: 520 + lt * 14, y: 760 + Math.sin(lt * 1.6) * 8, ang: Math.sin(lt * 1.3) * 0.05 }), 380, { at: t1 });
  // the force of the page: the wave rises on the word
  P.greatWave(1660, 900, 0.82, { at: P.cw(2, '拍水') - 0.2, dur: 2.0 });
  P.cartouche('一击三千里', 200, 420, { size: 52, at: t2 + 0.8, fill: 'redF' });
  P.cartouche('九万里', 1180, 210, { size: 64, at: P.cw(3, '九万里') });
  P.seal(1196, 470, '鹏', { size: 84, at: t4 + 0.4 });
});
