/* Isometric: a tiny 30° world on a hidden grid. Clean geometric blocks with three-tone faces (top light, left mid, right
 * dark), stations joined by belts, pipes and paths, capsule people, a soft pastel palette with one saturated accent and
 * floating labels on leader lines. For business models, supply chains, processes and how systems work. The kit (kit.js)
 * holds the scene: P.iso(...) and its blocks, tiles, paths, movers and labels. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '700 40px "Space Grotesk Variable"', '600 40px "Space Grotesk Variable"', '500 40px "Space Grotesk Variable"',
  '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'isometric',
  // geometry, not sketch: no wobble, one clean stroke
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // deep indigo ink on a cool pale ground; pastel tints for things, one saturated orange for the point
  palette: {
    ink: '#23264F', soft: '#4B4F7E', muted: '#8F93B8', faint: '#D6D9EA',
    orange: '#FF6B3D', orangeF: '#FFE0D3',  // THE accent: the product, the money, the thing that matters
    blue: '#5B7CFA', blueF: '#DCE3FF',      // information, data, the network
    purple: '#9D8CF5', purpleF: '#E7E2FD',  // the company, the platform, structure
    green: '#2FBF95', greenF: '#D2F2E7',    // growth, done, the right answer
    red: '#EE4F74', redF: '#FCDCE4',        // loss, a bottleneck, the wrong answer
    yellow: '#FFC53D', paper: '#FFFFFF',    // paper: a white card
    inkF: '#E6E8F3', softF: '#ECEDF6', mutedF: '#F0F1F8', faintF: '#F5F6FB',
  },
  // a cool pale ground with the iso grid printed almost invisibly and a soft light from the top left
  background: (stage) => {
    const s = 64, hx = s * Math.cos(Math.PI / 6), hy = s * Math.sin(Math.PI / 6);
    const tile = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${(2 * hx).toFixed(2)}" height="${(2 * hy).toFixed(2)}"><path d="M0 ${hy.toFixed(2)} L${hx.toFixed(2)} 0 L${(2 * hx).toFixed(2)} ${hy.toFixed(2)} L${hx.toFixed(2)} ${(2 * hy).toFixed(2)} Z" fill="none" stroke="#3B3F8C" stroke-opacity="0.045" stroke-width="1.2"/></svg>`);
    return [
      `radial-gradient(${stage.w * 0.7}px ${stage.h * 0.75}px at 28% 18%, rgba(255,255,255,0.75), transparent 70%)`,
      `url("data:image/svg+xml;utf8,${tile}")`,
      `linear-gradient(160deg, #EDEFFA 0%, #E0E3F4 60%, #D3D7EE 100%)`,
    ].join(',');
  },
};
