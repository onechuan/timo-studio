/* Blueprint: an engineering drawing in motion. Cyanotype blue ground with a fine drafting grid, crisp white linework
 * drafted at constant pen speed, dimension lines, section hatching, exploded views and numbered callouts, technical
 * lettering, and the odd red-pencil correction. For how things work: machines, systems, products, processes. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  '700 40px "Space Grotesk Variable"', '500 40px "Space Grotesk Variable"',
  '500 30px "IBM Plex Mono"', '400 30px "Ma Shan Zheng"',
]);
window.STYLE = {
  id: 'blueprint',
  // drafted, not sketched: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3.2, single: true,
  // white lines on cyanotype blue; the names keep their meanings: ink = the drafting line, red = red pencil (corrections,
  // the one thing that matters), yellow = a highlighter for the key dimension; *F fills are translucent tints of the ground
  palette: {
    ink: '#F2F7FF', soft: '#B9CFEE', muted: '#7FA0CF', faint: '#4D74AD',
    red: '#FF6B5B', redF: '#5B3A5E',        // red pencil: corrections, the failure point, the answer
    yellow: '#FFD866', paper: '#0F3B78',    // highlighter yellow for the key dimension; paper = the blueprint ground
    blue: '#8FE3FF', blueF: '#1E5394',      // cyan: a second system (fluid, signal, current) flowing through the drawing
    orange: '#FFB05C', orangeF: '#4A4466',  // warning / load / heat
    green: '#8EE6A8', greenF: '#1F5B6E',    // ok / passes
    purple: '#C9B2FF', purpleF: '#33407E',
    inkF: '#1C4C8E', softF: '#1A4787', mutedF: '#174382', faintF: '#14407D',
  },
  // cyanotype: deep Prussian blue, slightly uneven like a real print, a 24px drafting grid with heavier 120px lines,
  // a drawing border with zone marks, and a fine paper grain
  background: (stage) => {
    const W = stage.w, H = stage.h;
    const marks = [];
    for (let i = 1; i < 8; i++) { const x = (W / 8) * i; marks.push(`<line x1="${x}" y1="22" x2="${x}" y2="40" /><line x1="${x}" y1="${H - 40}" x2="${x}" y2="${H - 22}" />`); }
    for (let i = 1; i < 4; i++) { const y = (H / 4) * i; marks.push(`<line x1="22" y1="${y}" x2="40" y2="${y}" /><line x1="${W - 40}" y1="${y}" x2="${W - 22}" y2="${y}" />`); }
    const letters = 'ABCDEFGH'.split('').map((c, i) => `<text x="${(W / 8) * (i + 0.5)}" y="36" text-anchor="middle">${i + 1}</text>`).join('')
      + 'ABCD'.split('').map((c, i) => `<text x="31" y="${(H / 4) * (i + 0.5) + 5}" text-anchor="middle">${c}</text>`).join('');
    const frame = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g fill="none" stroke="#DCE9FF" stroke-opacity="0.32" stroke-width="2"><rect x="22" y="22" width="${W - 44}" height="${H - 44}"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" stroke-width="1.2"/>${marks.join('')}</g><g fill="#DCE9FF" fill-opacity="0.32" font-family="monospace" font-size="13">${letters}</g></svg>`);
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.92  0 0 0 0 1  0 0 0 0.07 0"/></filter><rect width="320" height="320" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${frame}") 0 0 / ${W}px ${H}px no-repeat`,
      `url("data:image/svg+xml;utf8,${grain}")`,
      'linear-gradient(rgba(220,235,255,0.13) 1.4px, transparent 1.4px) 0 0 / 120px 120px',
      'linear-gradient(90deg, rgba(220,235,255,0.13) 1.4px, transparent 1.4px) 0 0 / 120px 120px',
      'linear-gradient(rgba(220,235,255,0.055) 1px, transparent 1px) 0 0 / 24px 24px',
      'linear-gradient(90deg, rgba(220,235,255,0.055) 1px, transparent 1px) 0 0 / 24px 24px',
      `radial-gradient(${W * 0.9}px ${H * 0.85}px at 46% 42%, #15488C, #0F3B78 55%, #0B2F63 100%)`,
    ].join(',');
  },
};
