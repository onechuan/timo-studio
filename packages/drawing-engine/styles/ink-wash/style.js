/* Ink wash: Chinese ink painting on xuan paper. Graded ink greys (five tones of ink), brush strokes that taper and break
 * into flying white, washes that bloom, wide empty paper, and one cinnabar seal as the only colour that shouts. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['400 60px "Ma Shan Zheng"', '400 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"']);
window.STYLE = {
  id: 'ink-wash',
  // white-line drawing (白描): a light tremor, single stroke, a brush-like weight
  roughScale: 0.45, bowScale: 0.6, sw: 3.4, single: true,
  // same colour names as every style; the five tones of ink carry the picture, colours are light mineral washes
  palette: {
    ink: '#1A1714', soft: '#4A443E', muted: '#8A8178', faint: '#C9BFAE',
    red: '#B8321F', redF: '#EFCFC2',        // cinnabar: the seal, the one thing that matters on this screen
    orange: '#B9773A', orangeF: '#EEDCC3',  // ochre (赭石): earth, wood, warm skin of things
    green: '#5E7A5C', greenF: '#DCE3D3',    // stone green (石绿): moss, distant trees
    blue: '#4D6B80', blueF: '#D5DEE2',      // indigo (花青): water, robes, cold mist
    purple: '#7A5A66', purpleF: '#E6DAD8',  // dusty rouge
    yellow: '#D6A84A', paper: '#F3ECDC',    // gamboge (藤黄); paper = the xuan itself
    inkF: '#DCD3C2', softF: '#E3DBCB', mutedF: '#E9E2D3', faintF: '#EFE8DA',
  },
  // xuan paper: warm cream, slow cloudy unevenness, short fibres, a faint aged edge
  background: (stage) => {
    const fib = (() => {
      let x = 7 >>> 0; const r = () => { x = (x + 0x6d2b79f5) >>> 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      let d = '';
      for (let i = 0; i < 260; i++) {
        const px = r() * 600, py = r() * 600, a = r() * 6.283, l = 6 + r() * 22;
        d += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q${(Math.cos(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${r() < 0.55 ? 'rgba(140,112,78,' + (0.08 + r() * 0.1).toFixed(2) + ')' : 'rgba(255,252,240,' + (0.25 + r() * 0.3).toFixed(2) + ')'}" stroke-width="${(0.6 + r() * 0.8).toFixed(1)}" fill="none"/>`;
      }
      return encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${d}</svg>`);
    })();
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.24  0 0 0 0.10 0"/></filter><rect width="400" height="400" filter="url(#n)"/></svg>');
    const cloud = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.0026" numOctaves="4" seed="21"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.16 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${fib}")`,
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${cloud}")`,
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.9}px at 50% 46%, #F6F0E2, #F1E9D8 58%, #E6DAC3)`,
    ].join(',');
  },
};
