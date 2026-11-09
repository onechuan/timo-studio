/* Warm story illustration: flat warm illustration, soft shapes with almost no sketchiness, one metaphor object carried through. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['600 40px Fredoka', '500 40px Fredoka']);
window.STYLE = {
  id: 'warm-story',
  roughScale: 0.32, bowScale: 0.4, sw: 3.2, single: true,
  // same colour names as the runtime palette, so components and pages stay portable across styles
  palette: {
    ink: '#3A2E28', soft: '#6B5A4E', muted: '#A08E7E', faint: '#D8CBB8',
    red: '#C8603C', redF: '#F2D3C2',        // terracotta: the cost, the risk, the warning
    orange: '#E0A23B', orangeF: '#F6E2B8',  // mustard: money, the highlight, the answer
    green: '#7E9F7A', greenF: '#DCE7D5',    // sage: growth, the good path
    blue: '#2F6E72', blueF: '#CFE2DF',      // deep teal: the calm anchor, time, the long run
    purple: '#9A6B7C', purpleF: '#EBD8DC',  // dusty rose instead of violet
    yellow: '#EFC66A', paper: '#FBF4E8',
    inkF: '#E6DACB', softF: '#EADFD1', mutedF: '#F0E7DB', faintF: '#F6EFE4',
  },
  // flat warm ground with a soft horizon glow and fine grain; no dot grid (it reads as a notebook)
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0.09 0"/></filter><rect width="420" height="420" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.75}px at 50% 38%, #FBF3E6, #F4E7D3 62%, #EEDDC5)`,
    ].join(',');
  },
};
