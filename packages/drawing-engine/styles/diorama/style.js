/* 3D Miniature City: a tilt-shift miniature world drawn with three.js. A block of city and countryside on a floating
 * soil slab, toy-bright colours, low sunlight with long shadows, and a lens blur at the top and bottom of the frame so it
 * reads as a scale model photographed from above. For cities, geography and how places work. The kit (kit.js) holds the
 * scene: P.diorama(...) and its terrain, city blocks, roads and traffic, water, landmarks, labels and camera moves. */
window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat([
  '800 40px "Inter Tight Variable"', '700 40px "Inter Tight Variable"', '600 40px "Inter Tight Variable"',
  '800 40px "Noto Sans SC Variable"', '700 40px "Noto Sans SC Variable"', '500 40px "Noto Sans SC Variable"',
  '500 30px "IBM Plex Mono"',
]);
window.STYLE = {
  id: 'diorama',
  // clean geometry: no wobble
  roughScale: 0, bowScale: 0, sw: 3, single: true,
  // deep slate ink; toy-bright accents. Orange is the subject, blue the water, red the danger, green the land and growth
  palette: {
    ink: '#1E2A33', soft: '#47555F', muted: '#8B97A0', faint: '#D3DADF',
    orange: '#FF7A2F', orangeF: '#FFE2CF',
    blue: '#1E90D8', blueF: '#D3EAF8',
    red: '#E8433A', redF: '#FADAD6',
    green: '#38A856', greenF: '#D5F0DA',
    purple: '#7A5FD8', purpleF: '#E5DEF8',
    yellow: '#FFC628', paper: '#FFFFFF',
    inkF: '#E3E8EB', softF: '#E9EDF0', mutedF: '#EFF2F4', faintF: '#F5F7F8',
  },
  // the studio backdrop behind the model (the scene paints its own sky over this; it only shows before the first frame)
  background: () => 'linear-gradient(180deg, #A9C9E2 0%, #DCE3E6 55%, #EFE7DA 100%)',
};
