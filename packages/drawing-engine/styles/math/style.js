/* Math animation: programmatic mathematics in motion. A near-black ground, precise vector lines with no wobble, formulas
 * typeset in TeX (KaTeX, Computer Modern), coordinate planes, graphs traced by a moving dot, shapes that morph into one
 * another and formulas whose terms travel into the next line. Every variable keeps one colour for the whole film. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '400 40px KaTeX_Main', '700 40px KaTeX_Main', 'italic 400 40px KaTeX_Math', 'italic 400 40px KaTeX_Main',
  '400 40px KaTeX_Size1', '400 40px KaTeX_Size2', '400 40px KaTeX_AMS',
  '500 40px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'math',
  // typeset and plotted, never sketched: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3.2, single: true,
  // light lines on near-black. The names keep the house meanings, but in this style the colours are mostly handed to
  // variables (P.vars): blue, yellow, green, red, orange and purple are the six variable colours. ink = the
  // mathematics itself (axes, outlines, operators), soft/muted = construction and past states, faint = the dot grid
  // and the plane's background lines. *F fills are deep tints for areas.
  palette: {
    ink: '#ECEEF2', soft: '#AEB4BE', muted: '#727985', faint: '#30353D',
    blue: '#58B9E6', blueF: '#16303D',
    yellow: '#F4D66B', paper: '#15171B',
    green: '#86C46E', greenF: '#1C2E1E',
    red: '#EE6A5D', redF: '#3A1D1B',
    orange: '#F0A458', orangeF: '#38281A',
    purple: '#B48DE3', purpleF: '#2A2238',
    inkF: '#2A2D33', softF: '#24272C', mutedF: '#1F2226', faintF: '#1B1D21',
  },
  // near-black with the faintest lift toward the centre: the mathematics is the only thing that gives off light
  background: (stage) => [
    `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.9}px at 50% 46%, #14161A, #0E0F12 62%, #0A0B0D 100%)`,
  ].join(','),
};
