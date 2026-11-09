/* Mascot Explainer: kawaii flat cartoon on warm cream paper. Thick soft-brown outlines, flat pastel fills, rounded
 * everything, a cute host who does the maths with you. The kit (kit.js) holds the renderers; this file sets the
 * palette, the line and the paper. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['400 40px "ZCOOL KuaiLe"', '600 40px Fredoka', '500 40px Fredoka']);
window.STYLE = {
  id: 'mascot',
  // a clean, round vector line: plain primitives come out as smooth outlines, not sketches
  roughScale: 0, bowScale: 0, sw: 5, single: true,
  palette: {
    ink: '#3A2E28', soft: '#6B5D52', muted: '#A39586', faint: '#E9DCC8',
    red: '#F2665A', redF: '#FFD9D3',        // coral: the cost, the trap, "don't"
    orange: '#FF9A3C', orangeF: '#FFE2C4',  // orange: money, the highlight, the answer
    yellow: '#FFC93C', yellowF: '#FFF0BF',  // yellow: coins, pills, stickers
    green: '#3DB57D', greenF: '#D3F2DF',    // mint: saved, allowed, "worth it"
    blue: '#4A9BE0', blueF: '#D6EAFB',      // sky: rules, time, the official side
    purple: '#9B7BE6', purpleF: '#E8E0FA',  // lavender: the long run, the special case
    paper: '#FFF8EC',
    inkF: '#EFE4D4', softF: '#F2E8DA', mutedF: '#F6EEE2', faintF: '#FAF4EA',
  },
  // warm cream paper with a soft light in the upper left and a faint polka dot
  background: (stage) => [
    'radial-gradient(circle, rgba(200,150,90,0.10) 3px, transparent 3.5px) 0 0 / 56px 56px',
    `radial-gradient(${stage.w * 0.75}px ${stage.h * 0.85}px at 30% 25%, #FFFBF3, #FFF8EC 60%, #FCEFD9)`,
  ].join(','),
};
