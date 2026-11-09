/* Shadow puppetry (皮影戏): a cotton screen lit from behind by an oil lamp, inside a dark lacquered theatre frame.
 * Translucent dyed-leather puppets, pierced like lace, press against the cloth; the dyes glow where the lamp shines
 * through, carved holes glow brightest, overlaps go darker. The lamp, the frame and the flicker live in kit.js. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '600 40px "Noto Serif SC Variable"',
  '400 60px "Ma Shan Zheng"',
]);
window.STYLE = {
  id: 'shadow-puppet',
  // the few hand-drawn lines a page may still use are thin dark carved lines: no wobble, one stroke
  roughScale: 0.12, bowScale: 0.2, sw: 3, single: true,
  // the same colour names as every style: leather dyes seen with the lamp behind them
  palette: {
    ink: '#1A100A', soft: '#4A2C18', muted: '#8C6A46', faint: '#CDAF84',
    red: '#B8241A', redF: '#EFC09A',        // vermilion: heroes, loyalty, the hall, the thing that matters
    orange: '#D45A1E', orangeF: '#F2CC9C',  // flame: fire, the sun, anger
    green: '#24703C', greenF: '#CFD9A6',    // malachite: robes, trees, the second costume colour
    blue: '#22627C', blueF: '#C6D2B4',      // indigo: water, night robes, scholars
    purple: '#6A2846', purpleF: '#E2BFA6',  // aubergine: demons, the court's dark side
    yellow: '#D89A1E', paper: '#F6E6BE',    // ochre-gold: emperors, gold, light; paper = the lit cloth
    inkF: '#E4CC9C', softF: '#E9D3A6', mutedF: '#EEDAB0', faintF: '#F2E0B6',
  },
  // the cotton screen at full light: a fine weave, fibres and slow density blotches. The lamp's falloff, its flicker and
  // the theatre frame are drawn over it every frame by kit.js.
  background: (stage) => {
    const weave = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6"><rect width="6" height="6" fill="rgba(0,0,0,0)"/><path d="M0 1.5h6M0 4.5h6" stroke="rgba(120,80,40,0.07)" stroke-width="1"/><path d="M1.5 0v6M4.5 0v6" stroke="rgba(255,250,235,0.10)" stroke-width="1"/></svg>');
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.10 0"/></filter><rect width="360" height="360" filter="url(#n)"/></svg>');
    const cloud = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.0032" numOctaves="3" seed="17"/><feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.4  0 0 0 0 0.2  0 0 0 0.12 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${weave}")`,
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${cloud}")`,
      `radial-gradient(${stage.w * 0.8}px ${stage.h * 0.75}px at 50% 42%, #FFF3D4, #F6E4B8 55%, #EBCF98)`,
    ].join(',');
  },
};
