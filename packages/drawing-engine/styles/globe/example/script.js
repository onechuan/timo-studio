/* 3D Globe · benchmark film: How the internet crosses the oceans. Drawn to styles/globe/GRAMMAR.md (one globe a page, camera flights on spoken places, arcs, routes and the fan, numbers landing on places, a wide ending); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    webgl: true,
    vendor: ["three"],
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"EXAVITQu4vr4xnSDxMaL","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "en",
    style: "globe",
    title: 'How the Internet Crosses the Oceans',     // title of the narration script
    name: 'How the internet crosses the oceans',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/globe/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: 'Hook: data goes under the sea', title: 'Under the sea, not through space', cues: [
      'Say you are in London, opening a website.',
      'The site lives on a server in New York.',
      'How does the data cross the Atlantic? Most people guess satellites.',
      { t: 'In fact, about 99% travels through cables on the seabed.', hold: 0.8 },
    ] },
    { id: 'p02', section: 'A cable as thick as a garden hose', title: 'A thin line of light', cues: [
      'One of those cables starts on a beach in Cornwall.',
      'It is about as thick as a garden hose.',
      'Inside are glass fibres, each thinner than a hair.',
      { t: 'They carry pulses of light all the way to New York.', hold: 0.8 },
    ] },
    { id: 'p03', section: 'About 550 cables wrap the planet', title: 'A web on the ocean floor', cues: [
      'That is just one cable out of roughly 550.',
      'End to end, they run about 1.4 million kilometres.',
      { t: 'They link every inhabited continent into one network.', hold: 0.8 },
    ] },
    { id: 'p04', section: 'A handful of landing beaches', title: 'Where the cables come ashore', cues: [
      'All those cables come ashore at just a few places.',
      'Busy ones include Cornwall, Marseille, Mumbai and Singapore.',
      { t: 'Singapore is a meeting point for cables from across Asia.', hold: 1 },
    ] },
    { id: 'p05', section: 'Narrow passages and passing anchors', title: 'Where it can break', cues: [
      'Many routes between Europe and Asia squeeze through the Red Sea.',
      'Then they cross Egypt to reach the Mediterranean.',
      'Most breaks come from ship anchors and fishing gear.',
      { t: 'Repair ships haul the cable up and splice it back together.', hold: 0.6 },
    ] },
    { id: 'p06', section: 'Light under the sea', title: 'The whole world, by sea', cues: [
      'Next time you call someone abroad, picture this.',
      'About 99% of data between continents makes this trip.',
      { t: 'Your voice travels as light, along the seabed.', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
