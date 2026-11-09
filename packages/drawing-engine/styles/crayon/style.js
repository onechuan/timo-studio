/* Crayon picture book: wax crayon and oil pastel on cream drawing paper. The paper has a tooth (a fine bumpy grain) and
 * the wax only catches its peaks, so every stroke is speckled with paper; thick wobbly indigo outlines, scribbled fills
 * that spill past the lines, bright primary crayons, round childlike characters, hand-lettered words.
 * The tooth is computed once here and shared with kit.js (window.CRAYON), so the paper and the wax skip on one grain.
 * Wax-on-tooth adhesion adapted from crayon-book by LemoLab (MIT); see NOTICE.md. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(['700 40px "LXGW WenKai"', '400 40px "LXGW WenKai"', '600 40px Fredoka', '500 40px Fredoka']);
(function () {
  const N = 256;
  // tileable value noise: a lattice with period `per` cells across the tile
  const hash2 = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
  const lattice = (per, s) => { const a = new Float32Array(per * per); for (let y = 0; y < per; y++) for (let x = 0; x < per; x++) a[y * per + x] = hash2(x, y, s); return a; };
  function octave(px, py, per, cellW, cellH, L) {
    const fx = px / cellW, fy = py / cellH, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const u = tx * tx * (3 - 2 * tx), v = ty * ty * (3 - 2 * ty);
    const pw = Math.round(N / cellW), ph = Math.round(N / cellH);
    const g = (x, y) => L[((y % ph + ph) % ph) * per + ((x % pw + pw) % pw)];
    const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * u, b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * u;
    return a + (b - a) * v;
  }
  const L1 = lattice(128, 1), L2 = lattice(128, 2), L3 = lattice(128, 3), L4 = lattice(128, 4);
  const raw = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    raw[y * N + x] = 0.5 * octave(x, y, 128, 2, 2, L1) + 0.3 * octave(x, y, 128, 4, 4, L2) + 0.12 * octave(x, y, 128, 8, 8, L3) + 0.12 * octave(x, y, 128, 16, 2, L4);
  }
  let lo = Infinity, hi = -Infinity; for (const v of raw) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const tooth = new Float32Array(N * N);
  for (let i = 0; i < raw.length; i++) { const k = Math.min(1, Math.max(0, ((raw[i] - lo) / (hi - lo) - 0.14) / 0.72)); tooth[i] = k * k * (3 - 2 * k); }
  // the paper tile: cream, embossed by the tooth (lit from the upper left)
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d'), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x, t = tooth[i], d = t - tooth[((y + 1) % N) * N + ((x + 1) % N)];
    const k = 1 + d * 0.16 + (t - 0.5) * 0.035;
    img.data[i * 4] = Math.min(255, 248 * k); img.data[i * 4 + 1] = Math.min(255, 240 * k); img.data[i * 4 + 2] = Math.min(255, 221 * k); img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // a wax mask for DOM text: opaque where crayon catches the tooth
  const mk = document.createElement('canvas'); mk.width = mk.height = N;
  const mg = mk.getContext('2d'), mi = mg.createImageData(N, N);
  for (let i = 0; i < tooth.length; i++) { const a = Math.min(1, Math.max(0, (tooth[i] - 0.06) / 0.16)); mi.data[i * 4 + 3] = Math.round(255 * (0.25 + 0.75 * a)); }
  mg.putImageData(mi, 0, 0);
  const paperURL = cv.toDataURL('image/png'), waxURL = mk.toDataURL('image/png');
  window.CRAYON = { N, tooth, paper: cv, paperURL, waxURL };
  const st = document.createElement('style');
  st.textContent = `.tx { -webkit-mask-image: url(${waxURL}); mask-image: url(${waxURL}); -webkit-mask-size: 256px 256px; mask-size: 256px 256px; }`;
  document.head.appendChild(st);
})();
window.STYLE = {
  id: 'crayon',
  // plain primitives read as a soft crayon line: one wobbly stroke, a little thick
  roughScale: 1.3, bowScale: 1.4, sw: 5, single: true,
  // a box of crayons: bright primaries plus pink, peach and brown; outlines are indigo, never black; paper is the white crayon
  palette: {
    ink: '#2E3468', soft: '#585E92', muted: '#9C9EBC', faint: '#D9D2C2',
    red: '#E2453A', redF: '#F7B4A6',        // the important thing, apples, cheeks of an angry face, the warning
    orange: '#F28A2C', orangeF: '#F9C98F',  // the sun's rim, warmth, autumn, a fox
    yellow: '#F7C62E', yellowF: '#FBE59A',  // sun, moon, stars, light, ideas
    green: '#55A747', greenF: '#B9DE95',    // grass, leaves, growing, the good path
    blue: '#3A8BDB', blueF: '#A9D0F3',      // sky, water, rain, calm
    purple: '#8154BA', purpleF: '#CDB6EA',  // dusk, dreams, night flowers
    pink: '#F08BAA', pinkF: '#FAD0DC',      // cheeks, hearts, kindness
    peach: '#F7C9A0', brown: '#8C5A34', brownF: '#D9AE84', night: '#27306B',
    paper: '#FFFBF0',
    inkF: '#C8CAE0', softF: '#DADBEA', mutedF: '#E6E4EC', faintF: '#EFE9DC',
  },
  // cream drawing paper with a visible tooth; a soft spine shadow on the left edge (a right-hand page of a book)
  background: (stage) => [
    `linear-gradient(to right, rgba(110, 80, 40, 0.20), rgba(110, 80, 40, 0.06) 40px, rgba(110, 80, 40, 0) 90px)`,
    `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.9}px at 50% 45%, rgba(255, 252, 240, 0.35), rgba(255, 252, 240, 0) 70%)`,
    `url(${window.CRAYON.paperURL}) 0 0 / 256px 256px`,
    '#F8F0DD',
  ].join(','),
};
