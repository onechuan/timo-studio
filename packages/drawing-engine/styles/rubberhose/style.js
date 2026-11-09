/* Rubber-hose cartoon: a 1930s two-strip cartoon on aged cream stock. Noodle-limbed characters with pie-cut eyes and white
 * gloves bounce on the beat at 12 drawings a second; iris transitions, ornate title cards, a restrained film gate. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"',
  '900 40px "Fraunces Variable"', '700 40px "Fraunces Variable"',
]);
window.STYLE = {
  id: 'rubberhose',
  bpm: 120,   // the beat every character and prop bounces on (kit.js)
  // thick, confident ink: one heavy stroke, a little bow, no sketchy double lines
  roughScale: 0.22, bowScale: 0.35, sw: 5, single: true,
  // two-strip Technicolor: warm reds and oranges against teal-greens on cream stock; ink is a warm near-black
  palette: {
    ink: '#1B1512', soft: '#4A3F36', muted: '#8A7C6C', faint: '#C9BBA3',
    red: '#D0452F', redF: '#F2C9B5',        // tomato red: the impulsive one, danger, the punchline
    orange: '#E39A2D', orangeF: '#F5DDAF',  // marigold: warmth, reward, the highlight
    green: '#5E8C5A', greenF: '#D3DFC0',    // leaf green: the good path, growth
    blue: '#2F7D86', blueF: '#C7DFD9',      // two-strip teal (no true blue existed): the calm one, the future
    purple: '#8E4B5E', purpleF: '#E8CFD2',  // plum, never violet
    yellow: '#F2C94C', paper: '#FBF2DC',
    inkF: '#E3D3B5', softF: '#E8DABF', mutedF: '#EEE2C9', faintF: '#F3E9D3',
  },
  // aged cream stock: a warm centre, darker edges, fine paper grain (the moving film grain lives in kit.js)
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.13 0"/></filter><rect width="360" height="360" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `radial-gradient(${stage.w * 0.85}px ${stage.h * 0.8}px at 50% 45%, #F6EBD0, #EEDDBA 60%, #DDC69C)`,
    ].join(',');
  },
};
