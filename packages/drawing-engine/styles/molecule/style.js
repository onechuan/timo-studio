/* 3D Micro World (3D 微观世界): a molecular-biology animation drawn in three.js. A deep teal or midnight-blue medium
 * with drifting motes, glossy CPK molecules, DNA and protein ribbons, bilayer membranes and icosahedral capsids, a soft
 * depth of field that racks focus as the camera drifts and dives. The kit (kit.js) holds the 3D scene; this file is the
 * palette and the medium shown before the scene paints. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '600 40px "Inter Tight Variable"', '500 40px "Inter Tight Variable"',
  '600 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  '500 40px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'molecule',
  // clean vector strokes if a plain primitive is ever drawn (the scene is WebGL)
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  // same colour names as every style. ink is the label white; the accents are the scene's highlight lights:
  // orange is the interaction glow (binding, a bond forming), blue the protagonist, red/green/purple/yellow tag parts
  palette: {
    ink: '#EAF6F8', soft: '#A9C7CF', muted: '#6E929C', faint: '#24434D',
    blue: '#5CC8FF', blueF: '#123A52',
    orange: '#FFB547', orangeF: '#4A3418',
    red: '#FF6B7A', redF: '#4A1F2C',
    green: '#5BE0A8', greenF: '#123F38',
    purple: '#B48CFF', purpleF: '#2C2352',
    yellow: '#FFD866', paper: '#0B2530',
    inkF: '#16343D', softF: '#132E36', mutedF: '#10282F', faintF: '#0D2229',
  },
  // the medium: deep teal, lighter toward the upper middle, a soft vignette; the 3D scene paints the same medium over it
  background: (stage) => [
    `radial-gradient(${stage.w * 0.7}px ${stage.h * 0.75}px at 60% 36%, rgba(40,120,128,0.55), transparent 72%)`,
    'linear-gradient(180deg, #0C3640 0%, #072630 55%, #031319 100%)',
  ].join(','),
};
