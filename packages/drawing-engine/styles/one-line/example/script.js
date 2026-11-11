/* One line · benchmark film: why the closest relationships need room. Drawn to styles/one-line/GRAMMAR.md (one unbroken pen line, each drawing turning into the next, one spot of colour); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"EXAVITQu4vr4xnSDxMaL","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "en",
    style: "one-line",
    title: 'The Room Between Us',     // title of the narration script
    name: 'Why the closest relationships need room',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/one-line/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: 'Hook: how close is too close?', title: 'How close is too close?', cues: [
      'Two people who love each other turn to face each other.',
      'They lean in, closer and closer.',
      'It feels like the goal is no gap at all.',
      { t: 'So why do the closest people still need room?', hold: 0.6 },
    ] },
    { id: 'p02', section: 'Intuition: share every edge and the lines run together', title: 'Sharing every edge', cues: [
      'Share every plan, every friend, every evening.',
      'The outlines touch, then they overlap.',
      { t: "Soon you can't tell which line belongs to whom.", hold: 0.6 },
    ] },
    { id: 'p03', section: 'Mechanism: one line slowly serves two', title: 'One line, two people', cues: [
      'It happens quietly, a little at a time.',
      'One person drops a hobby, then a friend.',
      'Then an opinion, just to keep the peace.',
      { t: 'Untangle the line, and only one face is left.', hold: 0.6 },
    ] },
    { id: 'p04', section: 'Turn: the gap itself is a shape', title: 'The gap is a shape', cues: [
      'Now give the two faces some space.',
      'In 1915, the psychologist Edgar Rubin drew exactly this.',
      'Look again: the gap between them is a vase.',
      { t: 'The space between two people holds things too.', hold: 0.6 },
    ] },
    { id: 'p05', section: 'Example: room is ordinary life', title: 'What room looks like', cues: [
      'Room looks ordinary.',
      'A walk on your own, a friend who is only yours.',
      'Each of you walks your own road for a while.',
      { t: 'Then you come back with something new to tell.', hold: 0.6 },
    ] },
    { id: 'p06', section: 'Close: close enough to see, far enough to stay whole', title: 'Keep the gap', cues: [
      'So keep a little gap between you.',
      'Close enough to see each other clearly.',
      { t: 'Far enough that both faces stay whole.', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
