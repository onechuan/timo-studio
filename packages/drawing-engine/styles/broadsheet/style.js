/* Broadsheet: the data desk of a great financial newspaper. Salmon newsprint, serif headlines, hairline rules and
 * charts as the star; claret is the one accent that carries the story. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '500 40px "Noto Serif SC Variable"',
  '400 40px "Noto Sans SC Variable"', '600 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"',
  '600 40px "Fraunces Variable"', '800 40px "Fraunces Variable"', '400 40px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'broadsheet',
  // printed, not sketched: dead-straight lines, one stroke, a fine weight
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  palette: {
    ink: '#262A33', soft: '#5C5650', muted: '#968A80', faint: '#D9C8B8',
    red: '#990F3D', redF: '#F0CFCF',        // claret: the story, the one line that matters, the loss
    blue: '#0F5499', blueF: '#D3DDEA',      // oxford: the second series, the reference, the calm
    green: '#0D7680', greenF: '#CBE2DD',    // teal: growth, the good outcome
    orange: '#D96A1E', orangeF: '#F8D9BD',  // mandarin: warning, cost, the number to watch
    purple: '#5A3A7E', purpleF: '#E0D3E2',  // velvet
    yellow: '#F2B53A', paper: '#FFF8F1',    // paper = a clipping, a card one shade lighter than the newsprint
    inkF: '#E8D7C8', softF: '#EDDDCF', mutedF: '#F2E3D6', faintF: '#F7EADF',
  },
  // salmon newsprint: fine paper fibre, a soft lift where the light falls, the faintest column rules at the margins
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.10 0"/></filter><rect width="360" height="360" filter="url(#n)"/></svg>');
    const fibre = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0.07 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#f)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${fibre}")`,
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.85}px at 46% 36%, #FFF4EA, #FFF1E5 55%, #F9E4D3)`,
    ].join(',');
  },
};
