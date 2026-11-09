/* Transit Map: a metro diagram in the Harry Beck tradition. Thick colour-coded lines on a clean off-white ground, only
 * 0° / 45° / 90° with rounded bends, station ticks, white interchange rings, round line badges, a legend box, a pale
 * blue river. Processes and pathways become lines that branch and merge; a train draws each line as it runs. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '800 40px "Inter Tight Variable"', '700 40px "Inter Tight Variable"', '600 40px "Inter Tight Variable"', '500 40px "Inter Tight Variable"',
  '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '600 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'metro',
  // a diagram, not a sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 4, single: true,
  // line colours are the palette: each colour names one line; ink for lettering and interchange rings; *F are pale tints
  palette: {
    ink: '#1B1E23', soft: '#4A4F57', muted: '#9AA0A6', faint: '#D7D8D3',
    red: '#E1251B', redF: '#F8D4D1',
    blue: '#0A6FC2', blueF: '#CFE4F4',       // blueF is also the river
    green: '#00965E', greenF: '#CDEBDD',
    orange: '#F28C00', orangeF: '#FCE3C0',
    purple: '#7B3F98', purpleF: '#E5D7EE',
    yellow: '#F7C600', paper: '#FBFAF6',
    inkF: '#E6E6E1', softF: '#EBEBE6', mutedF: '#EFEFEA', faintF: '#F3F3EE',
  },
  // clean off-white map paper with the faintest print grain; no grid, no texture you can see
  background: () => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0.035 0"/></filter><rect width="260" height="260" filter="url(#n)"/></svg>');
    return [`url("data:image/svg+xml;utf8,${grain}")`, '#F7F6F1'].join(',');
  },
};
