/* Inked: one everyday object drawn hand-inked and isometric on warm paper, and shown doing its job. Flat colour in three
 * tones (light, mid, dark) by the way each face meets one fixed light, a heavy ink outline with finer inner lines, a flat
 * blue cast shadow, a gentle hand-drawn wobble, cream pill labels that light mustard while their part works, and step
 * pills the narration presses. The kit (kit.js) holds the figure: P.figure(...) and its drawing methods. Adapted from
 * Colorfigures (MIT); see NOTICE.md. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "IBM Plex Mono"', '600 40px "IBM Plex Mono"', '500 40px "IBM Plex Mono"',
  '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'inked',
  // a steady inked line: a little wobble, one stroke
  roughScale: 0.5, bowScale: 0.4, sw: 3, single: true,
  // warm brown-black ink on warm paper; the body colours of a riso print; mustard is what is working right now
  palette: {
    ink: '#231E16', soft: '#4F473A', muted: '#857D6E', faint: '#DDD6C8',
    yellow: '#F4B829',                      // THE accent: the part that is working, the step being pressed
    orange: '#EF6A4C', orangeF: '#FBDCD2',  // tomato: heat, the thing being made
    red: '#E2483D', redF: '#F8D6D2',        // stop, a fault, too hot
    green: '#3E9C6C', greenF: '#D6EEDF',    // mint: ready, done, clean
    blue: '#4F78C4', blueF: '#DCE5F5',      // cobalt: water, cold, flow
    purple: '#B0607A', purpleF: '#F6DCE4',  // blush
    paper: '#FBF8F0',
    inkF: '#E8E2D5', softF: '#ECE7DC', mutedF: '#F0ECE2', faintF: '#F5F2EA',
  },
  // warm paper with a fine printed grain and a soft light from the top left
  background: (stage) => {
    const tile = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="p"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .39  0 0 0 0 .33  .16 0 0 0 0"/></filter><rect width="100%" height="100%" filter="url(#p)"/></svg>`);
    return [
      `radial-gradient(${stage.w * 0.75}px ${stage.h * 0.8}px at 30% 22%, rgba(255,253,246,0.55), transparent 70%)`,
      `url("data:image/svg+xml;utf8,${tile}")`,
      `linear-gradient(170deg, #F4F1E9 0%, #EFEBE1 70%, #E9E4D8 100%)`,
    ].join(',');
  },
};
