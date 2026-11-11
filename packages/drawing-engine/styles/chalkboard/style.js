/* Chalkboard: a green-black slate, chalk lines that are a little rough and translucent, pastel chalk colours, dust in the corners. */
(function () {
  // chalk grain: punch small holes in every drawn layer (lines and fills) so it reads as chalk on slate, not as a vector stroke
  const defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<filter id="chalk" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1920">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 6.3" result="holes"/>' +
    '<feComposite in="SourceGraphic" in2="holes" operator="in"/>' +
    '</filter></defs></svg>';
  document.body.insertAdjacentHTML('beforeend', defs);
})();
window.STYLE = {
  id: 'chalkboard',
  roughScale: 0.95, bowScale: 0.9, sw: 3.6, single: false,
  // inverted palette, same names: ink is chalk white and paper is the slate; *F fills are dark tints of the slate
  // (a light fill on a dark board glows like a lamp, so every fill stays within a few steps of the board)
  palette: {
    ink: '#F1ECE1', soft: '#CBC6BA', muted: '#929A92', faint: '#58635D',
    red: '#F0A3A0', redF: '#3A3332',        // pink chalk: the problem, the cost
    orange: '#F2BE7E', orangeF: '#3A372C',  // peach chalk: the number that matters
    green: '#A9D49A', greenF: '#2C3B31',    // green chalk: the good path, ticks
    blue: '#9CC7E0', blueF: '#2A3A3D',      // blue chalk: structure, labels
    purple: '#C9AED3', purpleF: '#343239',  // lilac chalk, used sparingly
    yellow: '#F3DD86', paper: '#2A3631',    // yellow chalk is the highlight; paper is a slightly lifted slate
    inkF: '#38433D', softF: '#343F39', mutedF: '#303A35', faintF: '#2D3732',
  },
  // slate: deep green-black, broad low-contrast smudges of half-erased chalk, fine dust grain
  background: (stage) => {
    const dust = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><filter id="d"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.92  0 0 0 0 0.94  0 0 0 0 0.9  0 0 0 0.11 -0.02"/></filter><rect width="360" height="360" filter="url(#d)"/></svg>');
    const smudge = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="s"><feTurbulence type="fractalNoise" baseFrequency="0.0022 0.006" numOctaves="3" seed="17"/><feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 0 0.86  0 0 0 0.11 -0.02"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#s)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${dust}")`,
      `url("data:image/svg+xml;utf8,${smudge}")`,
      `radial-gradient(${stage.w * 1.0}px ${stage.h * 0.9}px at 48% 42%, #2A3631, #223029 58%, #1A2520)`,
    ].join(',');
  },
};
