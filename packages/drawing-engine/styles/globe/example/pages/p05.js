ENGINE.visual('p05', (P) => {
  P.globe({ view: [18, 50], spin: 0.4 });
  P.title('Narrow passages', { kicker: 'RISK' });

  // c0 — fly to the Red Sea, routes bunch through it
  P.gfocus('Red Sea', { at: 0.1, zoom: 1.8 });

  const ARAB = [14.5, 62.0], ADEN = [12.4, 47.5], BAB = [12.6, 43.3];
  const RED_S = [17.0, 40.5], RED_M = [22.0, 37.6], RED_N = [27.2, 34.4];
  const SUEZ = [29.95, 32.55], ZAF = [29.1, 32.65];
  const ALEX = [31.2, 29.9], ABU = [31.0, 29.6], PORTS = [31.27, 32.3];
  const MED_E = [33.2, 27.5], MED_W = [35.5, 18.0];

  const routes = [
    P.groute([[18.9, 72.8], ARAB, ADEN, BAB, RED_S, RED_M, RED_N, SUEZ, ALEX, MED_E, MED_W],
      { at: P.c(0, 0.4), dur: 4.2, color: 'orange', w: 1.6 }),
    P.groute([[6.5, 72.0], [11.0, 55.0], ADEN, BAB, [17.4, 40.1], [22.3, 37.9], RED_N, ZAF, ABU, [33.6, 26.0], [36.5, 15.5]],
      { at: P.c(0, 0.9), dur: 4.2, color: 'orange', w: 1.3 }),
    P.groute([[25.3, 56.6], [22.5, 60.5], ADEN, BAB, [16.6, 40.9], [21.6, 37.3], [27.0, 34.2], SUEZ, PORTS, [33.0, 30.5], [34.8, 22.0]],
      { at: P.c(0, 1.4), dur: 4.0, color: 'blue', w: 1.1 }),
  ];

  const redAt = P.cw(0, 'Red');
  P.gspread(RED_M, { at: redAt - 0.2, km: 320, color: 'red', dur: 1.6 });
  P.glabel(RED_M, 'Red Sea', { at: redAt });
  P.gdot('Mumbai', { at: P.c(0, 0.4), label: true });

  // c1 — push in on Egypt, where routes cross land to the Mediterranean
  const egAt = P.cw(1, 'Egypt');
  P.gfocus([28.5, 33.0], { at: egAt - 0.4, zoom: 2.6 });
  P.ghighlight('Egypt', { at: egAt, color: 'red' });
  P.gdot('Alexandria', { at: P.cw(1, 'Mediterranean', -0.2), label: true });
  P.glabel([33.6, 25.0], 'Mediterranean', { at: P.cw(1, 'Mediterranean') });

  // c2 — a break on one route: it flickers off, then relights at the repair (c3)
  const BRK = [25.0, 35.6];
  const brkAt = P.cw(2, 'breaks');
  const fixAt = P.cw(3, 'splice');
  P.gdot(BRK, { at: brkAt, color: 'red' });
  P.glabel(BRK, '{r:Anchors} / fishing gear', { at: P.cw(2, 'anchors', -0.1) });
  P.gspread(BRK, { at: brkAt, km: 120, color: 'red', dur: 1.0 });
  P.glabel([21.0, 39.6], 'Repair ship', { at: P.cw(3, 'Repair', -0.1) });
  P.gdot([21.5, 38.6], { at: P.cw(3, 'Repair', -0.1), color: 'green' });
  P.gspread(BRK, { at: fixAt, km: 160, color: 'green', dur: 1.2 });

  const elOf = (h) => h && (h.wrap || h.el || h.g || h.node || (h.style ? h : null));
  P.tick((lt) => {
    const el = elOf(routes[0]);
    if (!el || !el.style) return;
    let op = 1;
    if (lt >= brkAt && lt < fixAt) {
      const k = lt - brkAt;
      op = k < 0.8 ? (Math.floor(k * 10) % 2 ? 1 : 0.15) : 0.12;
    } else if (lt >= fixAt) {
      op = Math.min(1, 0.12 + (lt - fixAt) / 0.6);
    }
    el.style.opacity = op;
  });
});
