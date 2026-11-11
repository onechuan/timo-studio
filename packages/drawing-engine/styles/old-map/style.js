/* Antique Map (古地图): an atlas plate on old parchment. Warm, uneven rag paper with foxing, a centre fold and a cross
 * fold where the sheet was folded into the atlas, a tide-mark or two; iron-gall sepia ink; and faded hand-colouring in
 * vermilion, verdigris, gamboge and rose. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '600 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"',
  '500 40px "Fraunces Variable"', 'italic 460 40px "Fraunces Variable"', 'italic 600 40px "Fraunces Variable"',
]);
window.STYLE = {
  id: 'old-map',
  // a pen line: clean, no sketchy wobble
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  // the same colour names as every style: ink is iron-gall sepia; the colours are the colourist's faded washes
  palette: {
    ink: '#2B1D12', soft: '#5A4632', muted: '#8C7556', faint: '#C9B48C',
    red: '#B0442C', redF: '#EBC7AE',        // vermilion / red lead: the voyage, the empire that matters
    orange: '#B8782F', orangeF: '#ECD4A6',  // yellow ochre / sienna: hulls, camels, a second realm
    yellow: '#C9A43A',                      // gamboge
    green: '#5E7F55', greenF: '#D3DCBC',    // verdigris: a rival realm, the half-winds
    blue: '#486F86', blueF: '#CAD7D2',      // faded indigo: rivers, water-lining
    purple: '#80566F', purpleF: '#E0CCD2',  // rose madder / purple: a third realm
    paper: '#EBDDBC',
    inkF: '#DCCBA8', softF: '#E2D3B2', mutedF: '#E6D8B9', faintF: '#E9DCBF',
  },
  // parchment: rag fibres, an uneven warm tone, foxing thickest toward the edges, a tide-mark, and the folds
  background: (stage) => {
    const W = stage.w, H = stage.h;
    const R = (() => { let x = 41 >>> 0; return () => { x = (x + 0x6d2b79f5) >>> 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
    let fib = '';
    for (let i = 0; i < 220; i++) {
      const px = R() * 600, py = R() * 600, a = R() * 6.283, l = 5 + R() * 16;
      fib += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q${(Math.cos(a + 0.7) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.7) * l * 0.5).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="rgba(110,74,36,${(0.05 + R() * 0.07).toFixed(2)})" stroke-width="${(0.4 + R() * 0.7).toFixed(1)}" fill="none"/>`;
    }
    const fibres = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${fib}</svg>`);
    let fox = '';
    for (let i = 0; i < 110; i++) {
      let x = R() * W, y = R() * H;
      if (R() < 0.7) { if (R() < 0.5) x = R() < 0.5 ? R() * 170 : W - R() * 170; else y = R() < 0.5 ? R() * 120 : H - R() * 120; }
      const r = 1 + R() * 6;
      fox += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="rgba(140,86,38,${(0.06 + R() * 0.14).toFixed(2)})"/>`;
      if (R() < 0.15) fox += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r * 3).toFixed(1)}" fill="rgba(150,96,44,0.05)"/>`;
    }
    // a tide-mark where something wet once stood on the sheet, and the folds (centre and cross)
    const tide = `<circle cx="${W * 0.83}" cy="${H * 0.2}" r="118" fill="rgba(160,110,50,0.035)" stroke="rgba(130,84,36,0.13)" stroke-width="3"/><circle cx="${W * 0.83 + 6}" cy="${H * 0.2 + 3}" r="112" fill="none" stroke="rgba(130,84,36,0.06)" stroke-width="7"/>`;
    const fold = `<rect x="${W / 2 - 26}" y="0" width="26" height="${H}" fill="url(#fl)"/><rect x="${W / 2}" y="0" width="22" height="${H}" fill="url(#fr)"/><line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" stroke="rgba(90,58,26,0.22)" stroke-width="1.2"/><line x1="${W / 2 + 2}" y1="0" x2="${W / 2 + 2}" y2="${H}" stroke="rgba(255,248,230,0.5)" stroke-width="1.5"/>`
      + `<rect x="0" y="${H / 2 - 16}" width="${W}" height="16" fill="url(#ft)"/><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="rgba(90,58,26,0.12)" stroke-width="1"/><line x1="0" y1="${H / 2 + 1.5}" x2="${W}" y2="${H / 2 + 1.5}" stroke="rgba(255,248,230,0.35)" stroke-width="1.2"/>`;
    const defs = '<defs><linearGradient id="fl"><stop offset="0" stop-color="rgba(90,58,26,0)"/><stop offset="1" stop-color="rgba(90,58,26,0.10)"/></linearGradient><linearGradient id="fr"><stop offset="0" stop-color="rgba(255,248,230,0.22)"/><stop offset="1" stop-color="rgba(255,248,230,0)"/></linearGradient><linearGradient id="ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(90,58,26,0)"/><stop offset="1" stop-color="rgba(90,58,26,0.06)"/></linearGradient></defs>';
    const sheet = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}${tide}${fox}${fold}</svg>`);
    const blotch = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="4" seed="17"/><feColorMatrix values="0 0 0 0 0.52  0 0 0 0 0.36  0 0 0 0 0.16  0 0 0 0.16 0"/></filter><rect width="${W}" height="${H}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${sheet}") 0 0 / ${W}px ${H}px no-repeat`,
      `url("data:image/svg+xml;utf8,${fibres}")`,
      `url("data:image/svg+xml;utf8,${blotch}") 0 0 / ${W}px ${H}px no-repeat`,
      `radial-gradient(${W * 0.9}px ${H * 0.95}px at 50% 46%, #F0E3C3, #E9D9B4 58%, #D9C095)`,
    ].join(',');
  },
};
