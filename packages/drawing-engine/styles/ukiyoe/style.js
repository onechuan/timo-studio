/* Woodblock (浮世绘): an Edo-period colour woodblock print. Even black keylines cut in the key block, flat areas of
 * Prussian blue, indigo, vermilion, ochre and sage pressed on in turn with a hair of misregistration, bokashi gradients
 * where sky meets sea, mist bands across the view, a title cartouche and a seal, all on warm washi. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['900 60px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '700 40px "Fraunces Variable"', '400 60px "Ma Shan Zheng"']);
window.STYLE = {
  id: 'ukiyoe',
  // the key block: a firm, even line with no sketchy tremor
  roughScale: 0.18, bowScale: 0.25, sw: 4.2, single: true,
  // same colour names as every style; woodblock pigments, flat and opaque
  palette: {
    ink: '#1C1A17', soft: '#3E3A34', muted: '#7D7468', faint: '#C8BBA2',
    blue: '#1F4E79', blueF: '#9CB9CF',      // Prussian blue (ベロ藍): sea, sky, the cold side
    purple: '#2B3655', purpleF: '#C9C3CE',  // indigo (藍): deep water, night, robes
    red: '#C8442B', redF: '#EDC3B3',        // vermilion (朱): the sun, the seal, the one thing that matters
    orange: '#C9773A', orangeF: '#EFD3B4',  // persimmon: roofs, wood, warmth
    yellow: '#D9A441',                      // ochre / gamboge: cartouches, fields, lanterns
    green: '#5F7F5A', greenF: '#CFDCC5',    // pine and sage
    paper: '#EFE4CC',
    inkF: '#D9CDB6', softF: '#DFD4BE', mutedF: '#E6DCC7', faintF: '#ECE3CF',
  },
  // washi: warm cream, long fibres, a faint blotchy unevenness and a darker aged edge
  background: (stage) => {
    const fib = (() => {
      let x = 11 >>> 0; const r = () => { x = (x + 0x6d2b79f5) >>> 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      let d = '';
      for (let i = 0; i < 220; i++) {
        const px = r() * 600, py = r() * 600, a = r() * 6.283, l = 10 + r() * 34;
        d += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q${(Math.cos(a + 0.5) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.5) * l * 0.5).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${r() < 0.5 ? 'rgba(150,118,74,' + (0.07 + r() * 0.08).toFixed(2) + ')' : 'rgba(255,250,236,' + (0.3 + r() * 0.3).toFixed(2) + ')'}" stroke-width="${(0.5 + r() * 0.9).toFixed(1)}" fill="none"/>`;
      }
      return encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${d}</svg>`);
    })();
    const blotch = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.48  0 0 0 0 0.3  0 0 0 0.12 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${fib}")`,
      `url("data:image/svg+xml;utf8,${blotch}")`,
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.92}px at 50% 46%, #F2E8D2, #EDE1C7 60%, #E1D2B3)`,
    ].join(',');
  },
};
