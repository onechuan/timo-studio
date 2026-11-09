/* Red paper-cut: Chinese window flowers (窗花 / 剪纸). Saturated China-red paper cut with scissors — the picture is what
 * was cut away — laid flat on a deep indigo night paper (or warm gold / rice paper by day), with small gold-foil accents
 * and warm light pouring through the holes. Components live in kit.js. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '900 60px "Noto Serif SC Variable"', '700 40px "Noto Serif SC Variable"', '600 40px "Noto Serif SC Variable"',
  '800 40px "Fraunces Variable"', '600 40px "Fraunces Variable"', '400 60px "Ma Shan Zheng"',
]);
window.STYLE = {
  id: 'papercut',
  // a scissor cut, not a pencil: a faint hand wobble, one clean stroke
  roughScale: 0.25, bowScale: 0.3, sw: 3.2, single: true,
  // same colour names as every style. The default ground is indigo night paper, so `ink` is rice-paper cream (text on
  // the night), `paper` is the night itself; red is China red (the cut paper), yellow is gold foil, *F fills are dark dyes.
  palette: {
    ink: '#F6E7C6', soft: '#D9C59C', muted: '#8F90B4', faint: '#3B4373',
    red: '#D7261E', redF: '#5C1522',        // China red: the cut paper itself
    yellow: '#E2B24C', paper: '#1A2147',    // gold foil (one accent at a time); paper = indigo night paper
    orange: '#EE7F2D', orangeF: '#4A2418',  // lantern light, warm glow
    blue: '#5B74C0', blueF: '#28305E',      // the lighter indigo of far hills and night layers
    green: '#2E8C6E', greenF: '#163C38',    // jade paper
    purple: '#9A3D6C', purpleF: '#3A1C3A',
    inkF: '#2A3262', softF: '#262D58', mutedF: '#222950', faintF: '#1F2649',
  },
  // indigo dyed paper: slow cloudy dye, fibres, a few lighter specks; a dark edge like a sheet under a lamp
  background: (stage) => {
    const fib = (() => {
      let x = 11 >>> 0; const r = () => { x = (x + 0x6d2b79f5) >>> 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      let d = '';
      for (let i = 0; i < 220; i++) {
        const px = r() * 600, py = r() * 600, a = r() * 6.283, l = 8 + r() * 26;
        d += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q${(Math.cos(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}" stroke="${r() < 0.6 ? 'rgba(120,140,210,' + (0.08 + r() * 0.1).toFixed(2) + ')' : 'rgba(8,10,30,' + (0.2 + r() * 0.2).toFixed(2) + ')'}" stroke-width="${(0.6 + r() * 0.9).toFixed(1)}" fill="none"/>`;
      }
      return encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${d}</svg>`);
    })();
    const cloud = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.003" numOctaves="4" seed="17"/><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.3  0 0 0 0 0.55  0 0 0 0.22 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${fib}")`,
      `url("data:image/svg+xml;utf8,${cloud}")`,
      `radial-gradient(${stage.w * 0.95}px ${stage.h * 0.95}px at 50% 42%, #222B58, #1A2147 60%, #12173A)`,
    ].join(',');
  },
};
