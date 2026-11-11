/* Tech dark: a calm graphite ground, crisp clean lines, mono labels and one teal accent; for software and engineering. */
window.STYLE = {
  id: 'tech-dark',
  // drawn like a diagram, not a sketch: almost no wobble, one stroke, a lighter line weight
  roughScale: 0.15, bowScale: 0.1, sw: 2.4, single: true,
  // inverted palette, same names: ink is a warm off-white, paper is a raised panel, *F fills are dark tints
  // teal (blue) is the one accent; red/green/orange keep their meanings (error, ok, warning) and appear only for those
  palette: {
    ink: '#E8E6E1', soft: '#A9ADB1', muted: '#73797F', faint: '#3B4045',
    blue: '#4FBFAE', blueF: '#16302E',      // teal: the accent — the path, the selected thing, the answer
    orange: '#E3A64B', orangeF: '#2D2618',  // amber: warning, cost, the number that matters
    red: '#E2705F', redF: '#2F1D1B',        // coral red: error, failure
    green: '#8DC27C', greenF: '#1D2A1C',    // green: success, passing
    purple: '#B596AE', purpleF: '#29222A',  // muted mauve, never violet neon
    yellow: '#E6C566', paper: '#1B1E21',    // paper = a raised panel one step above the ground
    inkF: '#2A2E32', softF: '#25292D', mutedF: '#212428', faintF: '#1E2124',
  },
  // graphite with a very faint 48px grid and a soft lift in the centre; no glow, no gradient sky
  background: (stage) => [
    'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px) 0 0 / 48px 48px',
    'linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px) 0 0 / 48px 48px',
    `radial-gradient(${stage.w * 1.0}px ${stage.h * 0.9}px at 50% 40%, #1A1D20, #15171A 60%, #111315)`,
  ].join(','),
};
