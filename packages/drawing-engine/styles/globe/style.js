/* 3D Globe: a real-time three.js globe on a deep navy ground, in the manner of a newsroom graphics desk. The kit (kit.js) holds the
 * globe and its marks; world.js beside it holds the country shapes. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '800 40px "Inter Tight Variable"', '600 40px "Inter Tight Variable"', '500 40px "Inter Tight Variable"',
  '800 40px "Noto Sans SC Variable"', '600 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"',
  '500 24px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'globe',
  // clean vector lines: no wobble
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // inverted palette, same names: ink is a cool white on navy, *F fills are deep tints of each accent
  palette: {
    ink: '#EEF3FB', soft: '#B7C3D9', muted: '#7C8AA8', faint: '#2B3A5C',
    orange: '#FFB547', orangeF: '#4A3A2A',  // amber: THE flow colour, the number that matters
    blue: '#4CC9FF', blueF: '#123E63',      // cyan: the second flow, data, cables
    red: '#FF5A5F', redF: '#4A1F33',        // coral: risk, the hottest value, the chokepoint
    green: '#3DDC97', greenF: '#123F3D',    // mint: growth, clean energy
    purple: '#A78BFA', purpleF: '#2C2858',  // violet: a third series
    yellow: '#FFE066', paper: '#13213F',
    inkF: '#1D2C4F', softF: '#1A2747', mutedF: '#16223F', faintF: '#111B34',
  },
  // deep navy space: darker at the edges, a faint lift in the middle, a sparse field of dim stars
  background: (stage) => {
    let x = 7151 >>> 0;
    const rnd = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
    let dots = '';
    for (let i = 0; i < 120; i++) dots += `<circle cx="${(rnd() * stage.w).toFixed(0)}" cy="${(rnd() * stage.h).toFixed(0)}" r="${(0.5 + rnd() * 1.1).toFixed(1)}" fill="#CFE0FF" opacity="${(0.06 + rnd() * 0.26).toFixed(2)}"/>`;
    const stars = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}">${dots}</svg>`);
    return [
      `url("data:image/svg+xml;utf8,${stars}")`,
      `radial-gradient(${stage.w * 0.55}px ${stage.h * 0.62}px at 55% 46%, rgba(34,66,128,0.42), transparent 72%)`,
      `linear-gradient(180deg, #050A18 0%, #08122A 55%, #0A1530 100%)`,
    ].join(',');
  },
};
