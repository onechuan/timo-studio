/* Screencast: the film is a polished product demo of an invented desktop app. One large app window (title bar with
 * traffic lights, sidebar, toolbar, forms, menus, dialogs, toasts, tables, a spreadsheet) floats on a calm desk with a soft
 * shadow; a real arrow cursor glides on smooth curves and clicks with a ripple, the camera zooms to where it works and pulls
 * back, keystrokes show as keycaps and numbered step badges mark each step. kit.js draws it. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "Inter Variable"', '600 40px "Inter Variable"', '500 40px "Inter Variable"', '400 40px "Inter Variable"',
  '700 40px "Noto Sans SC Variable"', '600 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"',
  '400 30px "IBM Plex Mono"', '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'screencast',
  // software UI, not sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 2.5, single: true,
  // a light, neutral interface. blue is the ONE accent: the cursor's click, the active control, the selection.
  palette: {
    ink: '#151823', soft: '#4A5163', muted: '#8A91A3', faint: '#D9DCE4',
    blue: '#4F55F1', blueF: '#E8E9FE',      // the accent: cursor ripple, focus ring, selection, the primary button
    green: '#1E9E5A', greenF: '#DDF3E6',    // done, saved, success
    red: '#E0453B', redF: '#FCE3E0',        // error, delete, the wrong way
    orange: '#E8890C', orangeF: '#FCEBD2',  // warning, pending
    purple: '#8B5CF6', purpleF: '#EEE7FE',  // AI: anything the assistant writes
    yellow: '#F5C518', paper: '#FFFFFF',
    inkF: '#E9EBF0', softF: '#EEF0F3', mutedF: '#F3F4F7', faintF: '#F7F8FA',
  },
  // the default desk: a calm cool grey with a lift of light; pages paint their own with P.desk
  background: () => [
    'radial-gradient(900px 700px at 18% 10%, rgba(255,255,255,0.8), transparent 70%)',
    'radial-gradient(1100px 800px at 92% 100%, #C9D1E0, transparent 70%)',
    'linear-gradient(160deg, #EEF1F6 0%, #D9DFEA 100%)',
  ].join(','),
};
