/* Math animation · benchmark film: how gradient descent finds the bottom of a valley. Drawn to styles/math/GRAMMAR.md (one colour per variable, terms that travel between lines, a plane that stays put); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"EXAVITQu4vr4xnSDxMaL","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "en",
    style: "math",
    title: 'How gradient descent finds the bottom',     // title of the narration script
    name: 'How gradient descent finds the bottom',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/math/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
    publish: {              // publishing notes (npm run publish → out/发布信息.md); chapters = the PAGES sections below, timecodes computed
      titles: {
        bilibili: '',       // ≤ 80 characters
        youtube: '',        // ≤ 100 characters
        douyin: '',         // ≤ 30 characters
        shipinhao: '',      // WeChat Channels short title, ≤ 16 characters
        xiaohongshu: '',    // ≤ 20 characters
      },
      description: ``,      // 3–6 sentences: what this film covers and what viewers take away; the chapter list is appended automatically
      tags: [],
    },
  };
  const PAGES = [
    { id: 'p01', section: 'Hook: find the bottom without seeing it', title: 'A point in a valley', cues: [
      'This is how gradient descent finds the bottom of a valley.',
      'A point sits on the curve x squared, at x = 3.',
      'It cannot see the whole valley, only the ground beneath it.',
      { t: 'So how does it find the lowest point?', hold: 0.6 },
    ] },
    { id: 'p02', section: 'Intuition: the slope points uphill', title: 'The slope', cues: [
      'What the point can feel is the slope.',
      'For x squared, the slope is 2x.',
      'So at x = 3, the slope is 6.',
      'Positive means the ground rises to the right.',
      { t: 'So downhill is to the left.', hold: 0.6 },
    ] },
    { id: 'p03', section: 'Mechanism: step against the slope', title: 'One step', cues: [
      'So the point takes a step against the slope.',
      'New x is old x, minus step size times slope.',
      'The step size is called eta. Take eta = 0.1.',
      { t: 'Then 3 minus 0.1 times 6 gives 2.4.', hold: 0.8 },
    ] },
    { id: 'p04', section: 'Example: repeat until the slope is flat', title: 'Again and again', cues: [
      'Then it does the same thing again.',
      'At 2.4 the slope is 4.8, so x becomes 1.92.',
      'Each step comes out smaller than the one before.',
      'That is because the ground gets flatter near the bottom.',
      { t: 'At x = 0 the slope is 0, and the point stops.', hold: 0.8 },
    ] },
    { id: 'p05', section: 'Mechanism: too big a step overshoots', title: 'Too big a step', cues: [
      'Now make the step size too large: eta = 1.1.',
      'From 3, the point jumps past the bottom to minus 3.6.',
      'Then it jumps back, all the way to 4.32.',
      { t: 'It bounces side to side, higher each time, and never settles.', hold: 0.8 },
    ] },
    { id: 'p06', section: 'Close: the small step reaches the bottom', title: 'Back to the bottom', cues: [
      'Bring the step back to small, and it rolls again.',
      'From 3, step by step, it reaches the bottom at x = 0.',
      { t: 'Feel the slope, step against it, and keep the steps small.', hold: 1.2 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
