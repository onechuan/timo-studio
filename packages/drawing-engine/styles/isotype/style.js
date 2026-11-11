/* Isotype: pictorial statistics in the Vienna Method tradition (Otto Neurath, Marie Neurath, Gerd Arntz, 1920s–30s).
 * Flat geometric pictograms counted in rows on cream paper, four flat colours and black, no outlines, gradients or
 * shadows; a geometric sans in small capitals. One figure always stands for the same amount. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '400 40px "Jost Variable"', '500 40px "Jost Variable"', '600 40px "Jost Variable"',
  '400 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'isotype',
  // printed flat colour: no wobble, one clean edge
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // the Isotype inks: black, brick red, a slate blue, ochre, a warm grey; *F are the pale tints of map fields
  palette: {
    ink: '#1F1D1A', soft: '#4B4740', muted: '#8F897E', faint: '#CDC4B1',
    red: '#B23C29', redF: '#E7C7B8',
    blue: '#2F5B86', blueF: '#C9D3DA',
    orange: '#C98A22', orangeF: '#EDD9AE',
    green: '#5D7A47', greenF: '#D2D8BF',
    purple: '#6B4A5E', purpleF: '#DCCDD0',
    yellow: '#DDB042', paper: '#F1EADA',
    inkF: '#DED5C2', softF: '#E3DBC9', mutedF: '#E6DFCE', faintF: '#EAE3D3',
  },
  // cream offset paper with the faintest fibre; nothing you can see as texture at phone size
  background: () => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.05 0"/></filter><rect width="280" height="280" filter="url(#n)"/></svg>');
    return [`url("data:image/svg+xml;utf8,${grain}")`, '#F1EADA'].join(',');
  },
};
