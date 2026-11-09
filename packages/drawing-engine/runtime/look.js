/* A film's own look (SCRIPT.META.look) over its style's: palette entries by the runtime's colour names, the hand and
 * latin font stacks (their stylesheets are linked by boot.js from META.look.css), and the line (how rough, how bowed,
 * how wide, traced once or twice). Loaded after the style's style.js and before the runtime, which reads STYLE.palette.
 * A new paper colour becomes the ground, plain. */
(function () {
  const look = window.SCRIPT && SCRIPT.META && SCRIPT.META.look;
  if (!look) return;
  const style = (window.STYLE = window.STYLE || {});
  const palette = look.palette || {};
  style.palette = Object.assign({}, style.palette, palette);
  if (palette.paper) style.background = () => palette.paper;
  const root = document.documentElement.style;
  // the band behind a page's heading is the paper's own colour
  if (palette.paper) root.setProperty('--band-color', 'rgba(' + [1, 3, 5].map((i) => parseInt(palette.paper.slice(i, i + 2), 16)).join(', ') + ', 0.97)');
  for (const k of ['ink', 'soft', 'muted']) if (palette[k]) root.setProperty('--' + k, palette[k]);
  const fonts = look.fonts || {};
  if (fonts.hand) root.setProperty('--hand', fonts.hand);
  if (fonts.latin) root.setProperty('--latin', fonts.latin);
  // the faces it names are loaded before the first frame, like a style's own (main.js reads EXTRA_FONTS)
  const faces = [fonts.hand, fonts.latin].filter(Boolean).map((stack) => stack.split(',')[0].trim()).filter((f) => /^['"]/.test(f));
  window.EXTRA_FONTS = (window.EXTRA_FONTS || []).concat(...faces.map((f) => ['400 40px ' + f, '700 40px ' + f]));
  const line = look.line || {};
  if (line.rough != null) style.roughScale = line.rough;
  if (line.bow != null) style.bowScale = line.bow;
  if (line.sw != null) style.sw = line.sw;
  if (line.single != null) style.single = line.single;
})();
