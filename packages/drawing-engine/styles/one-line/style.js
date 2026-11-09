/* One line: a continuous single-line drawing in fine black ink on warm off-white paper. The pen never lifts; at most one
 * flat, soft-edged spot of colour sits behind the subject like a minimalist print; words are small gallery captions. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['300 40px "Fraunces Variable"', 'italic 300 40px "Fraunces Variable"', '400 40px "Fraunces Variable"', '300 40px "Noto Serif SC Variable"', '400 40px "Noto Serif SC Variable"']);
window.STYLE = {
  id: 'one-line',
  // plain primitives draw as the same even pen line: no wobble, one pass
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // same colour names as every style. The line is ink; the colours are the print's flat spots, soft and chalky
  palette: {
    ink: '#1C1A17', soft: '#4F4A43', muted: '#8E877D', faint: '#CFC7BA',
    red: '#D9694E', redF: '#F2CDBF',        // terracotta
    orange: '#E8A257', orangeF: '#F6DDBC',  // apricot
    yellow: '#E9C25E', yellowF: '#F6E6B8',  // mustard
    green: '#9DB48C', greenF: '#DCE6D2',    // sage
    blue: '#93B4CF', blueF: '#D9E6F0',      // powder blue
    purple: '#D7A2A8', purpleF: '#F1DCDD',  // blush rose
    paper: '#F5F0E7',
    inkF: '#E3DCD0', softF: '#E7E1D6', mutedF: '#ECE7DE', faintF: '#F0ECE4',
  },
  // warm off-white print paper: an even sheet, a fine grain, a faint deckle warmth at the edges
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.40  0 0 0 0 0.34  0 0 0 0 0.27  0 0 0 0.075 0"/></filter><rect width="360" height="360" filter="url(#n)"/></svg>');
    const cloud = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.52  0 0 0 0 0.4  0 0 0 0.06 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${cloud}")`,
      `radial-gradient(${stage.w * 1.0}px ${stage.h * 0.95}px at 50% 46%, #F7F3EB, #F4EFE5 62%, #ECE5D8)`,
    ].join(',');
  },
};
