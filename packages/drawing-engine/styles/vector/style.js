/* Flat vector science: a deep indigo night, saturated flat shapes with no outlines, two-tone shading and a thin rim
 * light, tiny birds for scale, journeys through orders of magnitude. The kit (kit.js) holds the renderers. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '800 40px "Inter Tight Variable"', '600 40px "Inter Tight Variable"',
  '800 40px "Noto Sans SC Variable"', '600 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"',
]);
window.STYLE = {
  id: 'vector',
  // geometry, not sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // inverted palette, same names: ink is a soft white, paper a raised indigo panel, *F fills are deep saturated tints
  // so a box reads as a flat coloured shape on the night, never a light card
  palette: {
    ink: '#F6F3FF', soft: '#C9C3EE', muted: '#8C84C4', faint: '#3A3274',
    blue: '#32BAEE', blueF: '#173A78',      // cyan: the protagonist, the path, the thing we follow
    orange: '#FFA62B', orangeF: '#5A2E3E',  // warm orange: energy, heat, the number that matters
    red: '#FF5D73', redF: '#561E4A',        // coral pink-red: danger, death, the wrong answer
    green: '#5CD18B', greenF: '#14484A',    // mint: life, growth, the right answer
    purple: '#A07CFF', purpleF: '#2E2470',  // violet: the unknown, the far away
    yellow: '#FACC12', paper: '#1E1850',    // paper: a raised indigo panel
    inkF: '#2A2266', softF: '#251E5C', mutedF: '#211A54', faintF: '#1B154A',
  },
  // deep indigo with a soft lift and a fixed scatter of faint stars (kit's vsky adds the twinkling layer per page)
  background: (stage) => {
    let x = 20260 >>> 0;
    const rnd = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
    let dots = '';
    for (let i = 0; i < 170; i++) dots += `<circle cx="${(rnd() * stage.w).toFixed(0)}" cy="${(rnd() * stage.h).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.15 + rnd() * 0.45).toFixed(2)}"/>`;
    const stars = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}">${dots}</svg>`);
    return [
      `url("data:image/svg+xml;utf8,${stars}")`,
      `radial-gradient(${stage.w * 0.75}px ${stage.h * 0.7}px at 62% 30%, rgba(80,52,190,0.55), transparent 70%)`,
      `linear-gradient(180deg, #0B0526 0%, #120A3C 55%, #1A1052 100%)`,
    ].join(',');
  },
};
