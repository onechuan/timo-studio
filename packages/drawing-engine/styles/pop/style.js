/* Pop comic: a 1960s comic page — cream newsprint, Ben-Day dots, thick black outlines, flat process red / yellow / blue,
 * panels, balloons and shouted sound effects. Its components live in kit.js (registered for every page). */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['400 40px "Archivo Black"', '900 40px "Noto Sans SC Variable"', '800 40px "Noto Sans SC Variable"', '700 40px "Space Grotesk Variable"']);
window.STYLE = {
  id: 'pop',
  // inked, not sketched: no wobble, one thick stroke
  roughScale: 0.08, bowScale: 0.05, sw: 6, single: true,
  // flat process colours, same names as every style; *F fills are printed tints (still saturated enough to read as ink on paper)
  palette: {
    ink: '#141414', soft: '#3B3734', muted: '#6E6860', faint: '#C9BFA6',
    red: '#E3221B', redF: '#F9B2A6',         // process red: the hit, the danger, the shout
    yellow: '#FFD60A', paper: '#FFFCF2',     // yellow: captions, bursts, the highlight; paper: panel white
    blue: '#1F5FD1', blueF: '#A9CFF5',       // process blue: calm, the system, the background dots
    orange: '#F7941D', orangeF: '#FFD39A',   // orange: reward, warmth
    green: '#2BA84A', greenF: '#BDE6B5',     // green: go, good, success
    purple: '#C2338B', purpleF: '#F4B6D9',   // magenta, Warhol's pink
    inkF: '#2A2725', softF: '#E9E0CB', mutedF: '#EFE7D4', faintF: '#F5EEDC',
  },
  // cream newsprint: faint misprinted blue dots, fibre grain and a little yellowing toward the edges
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.12  0 0 0 0.10 0"/></filter><rect width="400" height="400" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      'radial-gradient(circle, rgba(31, 95, 209, 0.10) 2.6px, transparent 3px) 0 0 / 22px 22px',
      'radial-gradient(circle, rgba(31, 95, 209, 0.10) 2.6px, transparent 3px) 11px 11px / 22px 22px',
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.85}px at 50% 45%, #FBF1D6, #F4E6C2 70%, #EAD7AA)`,
    ].join(',');
  },
};
