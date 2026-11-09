/* Chat Screen: the film plays out on phone screens. One or two phones on a soft colour ground, a generic messaging app
 * (grey and green bubbles, avatars, timestamps, read receipts, typing dots, voice bars, red packets, link cards), lock
 * screens, a social feed, a search box. Messages pop in with the voice; the camera pushes into a bubble. kit.js draws it. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '800 40px "Inter Variable"', '700 40px "Inter Variable"', '600 40px "Inter Variable"', '500 40px "Inter Variable"', '400 40px "Inter Variable"',
  '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'chat',
  // UI, not sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // interface colours: ink is UI text, the *F fills are the pale tints of system chips and banners
  palette: {
    ink: '#1B2232', soft: '#4B566B', muted: '#8B95A8', faint: '#D3D9E3',
    green: '#1FB25A', greenF: '#D6F4E1',    // sent, safe, the right way
    red: '#E5484D', redF: '#FCE1E1',        // fraud, warning, recalled, the wrong way
    blue: '#2F7CF6', blueF: '#DCE8FE',      // links, the system, the neutral fact
    orange: '#F59A0B', orangeF: '#FDEDD0',  // money, transfers, attention
    purple: '#8A5CF6', purpleF: '#ECE4FE',  // feelings, the other person
    yellow: '#F8C81C', paper: '#FFFFFF',
    inkF: '#E6EAF0', softF: '#ECEFF4', mutedF: '#F1F3F7', faintF: '#F6F7FA',
  },
  // the default ground: soft mint with a lift of light; pages paint their own with P.ground
  background: (stage) => [
    `radial-gradient(${stage.w * 0.6}px ${stage.h * 0.7}px at 30% 30%, rgba(255,255,255,0.55), transparent 70%)`,
    'linear-gradient(160deg, #E4F4EC 0%, #CFEADF 100%)',
  ].join(','),
};
