/* Product Tutorial: lessons told on real screenshots of the Frametell studio, on the studio's own dark ground. kit.js draws it. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "Inter Variable"', '600 40px "Inter Variable"', '500 40px "Inter Variable"',
  '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'tutorial',
  // UI, not sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // the studio's tokens (apps/web/src/styles.css): warm near-black paper, stone ink, amber accent
  palette: {
    ink: '#F5F5F4', soft: '#B0A9A3', muted: '#8F8780', faint: '#3D3834',
    orange: '#E0B88A', orangeF: '#3A2E22',   // the accent: what to click
    green: '#6FBF8E', greenF: '#1E3328',     // done, ready
    red: '#E2765E', redF: '#3A211B',         // careful, costs credits
    blue: '#7AA7E0', blueF: '#1C2636',
    purple: '#B39DDB', purpleF: '#2A2338',
    yellow: '#E8C96A', paper: '#181513',
    inkF: '#2A2622', softF: '#221F1C', mutedF: '#1F1C19', faintF: '#141210',
  },
  background: (stage) => [
    `radial-gradient(${stage.w * 0.7}px ${stage.h * 0.8}px at 50% 35%, rgba(224,184,138,0.08), transparent 70%)`,
    'linear-gradient(170deg, #141210 0%, #0C0A09 100%)',
  ].join(','),
};
