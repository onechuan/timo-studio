/* Watercolor: transparent washes on white cold-press paper. A loose graphite underdrawing stays visible, colour floods
 * in on the beat and dries with darker pooled edges, wet-in-wet bleeds, granulation, lots of untouched white paper. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['900 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '900 40px "Fraunces Variable"', 'italic 600 40px "Fraunces Variable"']);
window.STYLE = {
  id: 'watercolor',
  // pencil: a light, sketchy double line, thin graphite
  roughScale: 1.0, bowScale: 1.1, sw: 2.2, single: false,
  // artists' pigments, transparent; ink is graphite-indigo for lettering and pencil
  palette: {
    ink: '#2E3138', soft: '#5C6068', muted: '#9A9CA1', faint: '#D3D0C8',
    red: '#D2473C', redF: '#F6D5CF',        // pyrrole red: the point, the warning, the heart of the matter
    orange: '#E58F3C', orangeF: '#F8E0C6',  // cadmium orange / burnt sienna: earth, warmth, skin, wood
    green: '#5B9A5A', greenF: '#DCEBD5',    // sap green: leaves, growth, the good path
    blue: '#3C7DBA', blueF: '#D3E3F1',      // cerulean / ultramarine: sky, water, calm, distance
    purple: '#8A68A9', purpleF: '#E6DCEF',  // dioxazine violet: shadows, dusk, mystery
    yellow: '#F0BF45', paper: '#FBF8F1',    // gamboge; paper = the white of the sheet
    inkF: '#DDDCD8', softF: '#E5E4E0', mutedF: '#ECEBE7', faintF: '#F3F1EC',
  },
  // cold-press paper: bright white with a cool-warm tooth, fine fibres, a soft deckle shade at the edges
  background: (stage) => {
    const tooth = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="3" stitchTiles="stitch"/><feDiffuseLighting lighting-color="#fff" surfaceScale="1.6"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.43  0 0 0 0 0.40  -0.14 0 0 0 0.14"/></filter><rect width="420" height="420" filter="url(#n)"/></svg>');
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.38  0 0 0 0 0.35  0 0 0 0.07 0"/></filter><rect width="300" height="300" filter="url(#g)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${tooth}")`,
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.92}px at 50% 46%, #FEFDF9, #FBF9F3 62%, #F1ECE2)`,
    ].join(',');
  },
};
