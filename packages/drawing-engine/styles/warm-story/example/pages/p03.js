/* p03 Compounding: a small snowball rolls from the top of the slope, growing as it goes, and comes to rest at the bottom. */
ENGINE.visual('p03', (P) => {
  P.title('收益也会生钱', { accent: 'blue' });
  const X0 = 220, Y0 = 430, X1 = 1720, Y1 = 800;
  const surf = (x) => Y0 + ((x - X0) * (Y1 - Y0)) / (X1 - X0);
  // far hills, then the snow slope with a sage edge, so the white ball reads against it
  P.path('M-200 540 C 300 420 620 470 900 430 S 1500 380 2120 450 L2120 905 L-200 905 Z', { at: 0, fill: 'greenF', color: 'greenF', dur: 0.3 });
  // the slope enters from beyond the left edge; only its top edge is drawn, so it reads as land, not a diagram
  const yAt = (x) => Y0 + ((x - X0) * (Y1 - Y0)) / (X1 - X0);
  P.path(`M-200 ${yAt(-200)} L2120 ${yAt(2120)} L2120 905 L-200 905 Z`, { at: 0, fill: 'blueF', color: 'blueF', dur: 0.4 });
  P.line(-200, yAt(-200), 2120, yAt(2120), { at: 0, color: 'green', sw: 5, dur: 0.5 });
  P.tree(360, Y0 + 18, 170, { at: 0.1, grow: 1 });
  const t1 = P.c(1), t4 = P.c(4) + 1.2;
  const k = (lt) => PV.ease.inOut(PV.clamp((lt - t1) / (t4 - t1)));
  const x = (lt) => PV.lerp(460, 1500, k(lt));
  const r = (lt) => PV.lerp(28, 136, Math.pow(k(lt), 1.6));
  P.snowball(x, (lt) => surf(x(lt)) - r(lt) * 0.92, r, { at: t1 - 0.3, spin: (lt) => (x(lt) - 460) * 0.55 });
  P.tag(860, 300, '每年 8%', { at: P.c(1) + 0.4, size: 48, bg: 'paper', color: 'blue' });
  P.tag(1250, 330, '收益再生收益', { at: P.c(2) + 0.2, size: 42, bg: 'paper', color: 'soft' });
  P.cam([P.pan(P.c(3), 1040, 600), P.slam(t4 - 0.15, 1360, 620, 1.12), P.back(t4 + 0.9)]);
});
