/* Manga: a black-and-white Japanese comic page — white paper, G-pen ink that swells and tapers, screentone instead of
 * grey, slanted panel gutters, concentration lines, hand-lettered sound effects. One spot colour (red) is kept for the
 * climax. Its components live in kit.js (registered for every page). */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"',
  '700 40px "Noto Serif SC Variable"', '900 40px "Noto Serif SC Variable"',
  '800 40px "Inter Tight Variable"', '400 40px "Ma Shan Zheng"',
]);
window.STYLE = {
  id: 'manga',
  // inked with a pen, not sketched: no wobble, one clean stroke
  roughScale: 0.04, bowScale: 0.04, sw: 4, single: true,
  // monochrome print: every colour name maps to ink or a grey a printer would make with tone. red is the one spot colour.
  palette: {
    ink: '#111111', soft: '#2E2E2E', muted: '#6B6B6B', faint: '#C4C4C4',
    red: '#D7262E', redF: '#F6CDCB',          // the spot colour: only the climax (an sfx, a stamp, one word)
    blue: '#1F1F1F', blueF: '#E4E4E4',        // no blue in a black-and-white book: near-ink and a light tone
    green: '#2A2A2A', greenF: '#E8E8E8',
    orange: '#3A3A3A', orangeF: '#E0E0E0',
    purple: '#262626', purpleF: '#DDDDDD',
    yellow: '#D9D9D9', paper: '#FFFFFF',      // yellow (highlighter) becomes a pale grey; paper is the page white
    inkF: '#D6D6D6', softF: '#E2E2E2', mutedF: '#EDEDED', faintF: '#F4F4F4',
  },
  // bright manga paper: barely warm white, a whisper of pulp grain
  background: () => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0.05 0"/></filter><rect width="320" height="320" filter="url(#n)"/></svg>');
    return [`url("data:image/svg+xml;utf8,${grain}")`, 'linear-gradient(#FCFCFA, #F7F7F4)'].join(',');
  },
};
