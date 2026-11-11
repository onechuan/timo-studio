/* Neon noir: a city at night drawn in light. Near-black ground, glowing neon tubes in magenta, cyan and violet that
 * ignite with a flicker, a synthwave grid floor running to the horizon, scanlines, HUD readouts and numbers that glitch
 * into place. For AI and future tech, startups, internet culture, games and big trends. Components live in kit.js. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "Space Grotesk Variable"', '500 40px "Space Grotesk Variable"',
  '900 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'neon',
  // drawn in light, not pencil: no wobble, one clean stroke; every engine stroke glows (style.css)
  roughScale: 0, bowScale: 0, sw: 4, single: true,
  // inverted palette, same names as every style: ink is a cool near-white, paper a dark glass panel, *F fills are dark tints.
  // magenta (red) is THE accent; cyan (blue) the second voice; violet (purple) the third; the rest keep their meanings
  palette: {
    ink: '#F2EEFF', soft: '#B9B2D9', muted: '#6F6893', faint: '#2C2745',
    red: '#FF2E88', redF: '#3A0D24',        // hot magenta: the point, the number that matters, the warning sign
    blue: '#22E5FF', blueF: '#082F3A',      // electric cyan: the system, the path, data in motion
    purple: '#9B5CFF', purpleF: '#211343',  // violet: the third colour, glows, the horizon
    yellow: '#FFE45C', paper: '#120F22',    // yellow: rare highlight; paper = a dark glass panel
    orange: '#FF8A3D', orangeF: '#3A1D0C',  // orange: cost, heat
    green: '#3CFFA0', greenF: '#0C3323',    // acid green: success, "online"
    inkF: '#1C1833', softF: '#181430', mutedF: '#15122A', faintF: '#110E22',
  },
  // night: a violet haze over near-black, a faint glow low in the frame where the horizon sits, fine film grain
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.6  0 0 0 0 1  0 0 0 0.05 0"/></filter><rect width="300" height="300" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.45}px at 50% 78%, rgba(155, 92, 255, 0.16), transparent 70%)`,
      `radial-gradient(${stage.w * 0.6}px ${stage.h * 0.5}px at 18% 10%, rgba(255, 46, 136, 0.06), transparent 70%)`,
      `linear-gradient(180deg, #07060D 0%, #0B0918 55%, #120C24 100%)`,
    ].join(',');
  },
};
