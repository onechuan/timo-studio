/* 3D Exploded View: a product-launch studio render in three.js. A seamless soft-grey cyclorama, softbox key and rim light
 * with contact shadows, satin plastic, brushed metal and frosted glass; the product turns once on a turntable, comes apart
 * into labelled layers along one axis, and snaps back together. For how things are built and how they work inside. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '600 40px "Inter Tight Variable"', '300 40px "Inter Tight Variable"', '500 40px "Inter Tight Variable"',
  '600 40px "Noto Sans SC Variable"', '400 40px "Noto Sans SC Variable"', '300 40px "Noto Sans SC Variable"',
  '500 30px "IBM Plex Mono"', '400 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'exploded',
  // a clean vector line (only used by the few plain primitives a page may still draw)
  roughScale: 0, bowScale: 0, sw: 2, single: true,
  // graphite type on studio grey. ink = graphite text and leader lines; orange = the one signal colour (the part that
  // matters, the key number); blue = what flows (current, ions, air); red / green = bad / good; paper = the cyclorama
  palette: {
    ink: '#16181C', soft: '#4A4F58', muted: '#868C96', faint: '#BFC3CA',
    orange: '#FF5A1F', orangeF: '#FFE2D4',
    blue: '#2F6BFF', blueF: '#DCE6FF',
    red: '#E5484D', redF: '#FBDDDE',
    green: '#22A06B', greenF: '#D6F0E3',
    purple: '#7B61FF', purpleF: '#E6E0FF',
    yellow: '#F2B01E', paper: '#E4E6EA',
    inkF: '#D3D6DB', softF: '#DADDE1', mutedF: '#DFE1E5', faintF: '#E9EBEE',
  },
  // the cyclorama: a seamless studio sweep, lit from above-left, a soft pool of light behind the product, darker
  // at the floor's front edge and the corners; fine grain so the gradient never bands
  background: (stage) => {
    const W = stage.w, H = stage.h;
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.52  0 0 0 0.05 0"/></filter><rect width="300" height="300" filter="url(#n)"/></svg>');
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `radial-gradient(${W * 0.55}px ${H * 0.5}px at 50% 46%, rgba(255,255,255,0.55), rgba(255,255,255,0) 100%)`,
      `radial-gradient(${W * 1.1}px ${H * 1.0}px at 38% 18%, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)`,
      `linear-gradient(180deg, #E9EBEE 0%, #E3E5E9 48%, #D9DCE1 76%, #CDD1D7 100%)`,
    ].join(',');
  },
};
