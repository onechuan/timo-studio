/* 3D cosmos: a cinematic space documentary drawn live in three.js. Deep black space with a seeded star field and a
 * faint nebula, lit planets with a sharp terminator and an atmosphere rim, the Sun as a glowing sphere, thin orbit lines,
 * flat HUD callouts pinned to 3D points, and a camera that pulls back through powers of ten. The kit (kit.js) holds the
 * scene; pages never touch three.js directly. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '600 40px "Inter Tight Variable"', '300 40px "Inter Tight Variable"', '500 40px "Inter Tight Variable"',
  '600 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"', '300 40px "Noto Sans SC Variable"',
  '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'cosmos',
  // instruments, not pencils: no wobble, one clean hairline stroke
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  // inverted palette, same names as every style: ink is starlight white, paper a dark glass panel, *F fills are deep tints.
  // blue = the HUD (scale rings, measurements), orange = sunlight and the number that matters, purple = the far away
  palette: {
    ink: '#F2F5FA', soft: '#B9C3D6', muted: '#6F7B94', faint: '#273044',
    blue: '#7FD4FF', blueF: '#0E2436',      // instrument cyan: scale rings, distance callouts, trajectories
    orange: '#FFB45C', orangeF: '#3A2410',  // sunlight gold: the Sun, heat, the number that matters
    yellow: '#FFE29A', paper: '#0C111B',    // pale gold highlight; paper = a dark glass panel
    red: '#FF6B5B', redF: '#3A1512',        // danger, red giants, Mars
    green: '#7DE3B0', greenF: '#10301F',    // life, the habitable zone
    purple: '#B19CFF', purpleF: '#1F1838',  // the deep, the galaxy, the unknown
    inkF: '#141A26', softF: '#121722', mutedF: '#10141E', faintF: '#0D111A',
  },
  // space: near-black with the faintest cold lift; the stars and nebula are drawn in 3D by the kit's P.space
  background: (stage) => [
    `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.8}px at 55% 40%, rgba(24, 34, 62, 0.55), transparent 72%)`,
    `linear-gradient(180deg, #020309 0%, #03050C 60%, #05060E 100%)`,
  ].join(','),
};
