/* Clay studio: a stop-motion claymation set. Plasticine characters and props with soft rounded volume, thumb-pressed
 * texture and a contact shadow under everything, on a pastel seamless-paper sweep in warm studio light. Everything moves
 * on twos (12 drawings a second) with a slight boil between drawings, squashing and stretching like real clay. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 40px "Noto Sans SC Variable"', '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"',
  '400 40px "Archivo Black"', '800 40px "Fraunces Variable"',
]);
window.STYLE = {
  id: 'clay',
  // soft and round, never sketchy: one clean stroke for anything drawn with the general tools
  roughScale: 0, bowScale: 0, sw: 6, single: true,
  // plasticine pastels: saturated but chalky, never neon; ink is a warm cocoa brown, paper is white clay
  palette: {
    ink: '#3B2A26', soft: '#6E5650', muted: '#A88F86', faint: '#DCC8BD',
    red: '#E5594B', redF: '#F7C7BE',        // tomato clay: the problem, the alarm, the hot thing
    orange: '#F39A3E', orangeF: '#FAD9B3',  // apricot: the hero's default colour, warmth, energy
    yellow: '#F7C843', yellowF: '#FBEBB4',  // butter: light, ideas, coins, the highlight
    green: '#69BC6C', greenF: '#CFEBC9',    // pea green: growth, good, nature
    blue: '#4D9AD9', blueF: '#C8E0F4',      // sky blue: calm, water, cool, the second character
    purple: '#9C7CD3', purpleF: '#E1D5F3',  // lilac: dreams, the mind, mystery
    pink: '#F08FB0', pinkF: '#FAD6E3',      // bubblegum: brains, hearts, cheeks
    paper: '#FFF7EE',
    inkF: '#E9D9CF', softF: '#EFE1D7', mutedF: '#F3E7DE', faintF: '#F7EEE7',
  },
  // the default set: a peach seamless-paper sweep, the wall curving into the floor, lit warm from the upper left
  background: (stage) => [
    `radial-gradient(${stage.w * 0.7}px ${stage.h * 0.62}px at 34% 30%, rgba(255,246,236,0.75), rgba(255,246,236,0) 70%)`,
    `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.9}px at 50% 50%, rgba(0,0,0,0) 60%, rgba(120,60,40,0.16) 100%)`,
    'linear-gradient(to bottom, #F5D7C6 0%, #F3D0BD 58%, #F0C7B2 70%, #F6D8C7 86%, #F2CFBB 100%)',
  ].join(','),
};
