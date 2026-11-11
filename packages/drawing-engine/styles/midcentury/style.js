/* Mid-century cartoon (1950s classroom film): flat colour printed a few pixels off a thin, broken ink line; geometric
 * presenters with dot eyes and held bodies; sunbursts, starbursts, boomerangs and numbered step cards on warm cream
 * stock. The kit (kit.js) holds the renderers; this file sets the palette, the line and the paper. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '400 40px "Archivo Black"',
  '900 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  'italic 900 40px "Fraunces Variable"', '700 40px "Space Grotesk Variable"', '500 40px "Space Grotesk Variable"',
]);
window.STYLE = {
  id: 'midcentury',
  // a thin, steady ink line with a little hand in it (the kit draws its own broken pressure line)
  roughScale: 0.25, bowScale: 0.3, sw: 4, single: true,
  // the 1950s limited palette on cream stock: mustard, teal, tomato, coral, avocado, plum; ink is a warm brown-black
  palette: {
    ink: '#2B2420', soft: '#5C4636', muted: '#8C7B6A', faint: '#CDBFA6',
    red: '#D9553A', redF: '#F2B9A6',        // tomato: the action, the warning, the arrow head
    orange: '#E8833A', orangeF: '#F6CFA4',  // coral orange: warmth, the presenter's sweater
    yellow: '#E3AE36', yellowF: '#F3D88E',  // mustard: the sunburst, the step card, the highlight
    blue: '#3A9A94', blueF: '#AED8D1',      // teal: the product, the right way, calm
    green: '#9AA24E', greenF: '#D8DBA2',    // avocado: growth, done, outdoors
    purple: '#6E4A6B', purpleF: '#D9C3D3',  // plum: night, the unknown, the villain
    paper: '#F6EDDA',                       // cream stock
    inkF: '#E5D7BC', softF: '#E9DCC3', mutedF: '#EEE3CD', faintF: '#F2E9D6',
  },
  // cream stock: a warm centre, darker edges, fine print grain and a few paper fibres
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.11 0"/></filter><rect width="320" height="320" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `radial-gradient(${stage.w * 0.85}px ${stage.h * 0.8}px at 50% 45%, #F8F0DF, #F3E8D1 60%, #E6D6B6)`,
    ].join(',');
  },
};
