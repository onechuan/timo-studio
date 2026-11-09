/* Collage: the investigative desk (Vox-style explainers). Torn newsprint, halftone archive prints, black label strips, red
 * marker, yellow highlighter and red thread on a warm paper desk; one red, one yellow, everything else ink and paper. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '400 40px "Fraunces Variable"', '800 40px "Fraunces Variable"', '400 40px "Noto Serif SC Variable"', '800 40px "Noto Serif SC Variable"',
  '900 40px "Noto Sans SC Variable"', '400 40px "Archivo Black"', '400 30px "IBM Plex Mono"', '600 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'collage',
  // marker on paper: a little wobble, one stroke, a felt-tip weight
  roughScale: 0.35, bowScale: 0.4, sw: 3, single: true,
  // same colour names as the runtime palette; red is the marker, yellow the highlighter, the rest is ink, paper and archive tints
  palette: {
    ink: '#1D1B19', soft: '#4A4540', muted: '#8A8279', faint: '#C9C0B2',
    red: '#B8433F', redF: '#EBCFC6',        // marker red: the circled word, the thread, the stamp, the one thing that matters
    yellow: '#DACF08', paper: '#EFE9DC',    // highlighter yellow (olive-leaning, multiplied); paper = newsprint
    orange: '#C27A2C', orangeF: '#F0DCC0',  // old-map ochre: secondary emphasis, sparingly
    blue: '#3E5C76', blueF: '#D3DCE2',      // archive blue ink: maps, blueprints, a second data series
    green: '#5D7A52', greenF: '#D9E1D0',    // ledger green: success, growth
    purple: '#6D5872', purpleF: '#E1D8E0',
    inkF: '#DDD5C6', softF: '#E3DCCF', mutedF: '#E8E2D6', faintF: '#EEE9DF',
  },
  // the desk: warm paper with fibres and a slow, uneven tone; static (paper never shimmers)
  background: (stage) => {
    const grain = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.16 0"/></filter><rect width="400" height="400" filter="url(#n)"/></svg>');
    const blotch = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${stage.w}" height="${stage.h}"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="21"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.38  0 0 0 0 0.22  0 0 0 0.16 0"/></filter><rect width="${stage.w}" height="${stage.h}" filter="url(#b)"/></svg>`);
    return [
      `url("data:image/svg+xml;utf8,${grain}")`,
      `url("data:image/svg+xml;utf8,${blotch}")`,
      `radial-gradient(${stage.w * 0.9}px ${stage.h * 0.8}px at 48% 42%, #E9E3D6, #E0D8C9 60%, #D5CCBB)`,
    ].join(',');
  },
};
