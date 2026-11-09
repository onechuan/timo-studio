/* 3D Micro World · benchmark film: How DNA copies itself (a dive from the cell into the helix, the base pairs named, helicase opening the fork, new letters pairing A–T and G–C, one helix becoming two). Drawn to styles/molecule/GRAMMAR.md (one P.micro scene per page, the dive, labels on leaders, the helix unzipping on the word, a pull-back at the end); also this style's regression test. */
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
    style: "molecule",
    title: 'How DNA Copies Itself',     // title of the narration script
    name: 'How DNA copies itself',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/molecule/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: 'Every new cell needs a full copy', title: 'A copy for every cell', cues: [
      'This is how your DNA copies itself.',
      { t: 'Before a cell splits in two, it copies all its DNA.', hold: 0.6 },
      'In a human cell, that is about 3 billion letters.',
      'It takes a few hours, with almost no mistakes.',
    ] },
    { id: 'p02', section: 'DNA is a twisted zipper', title: 'A twisted zipper', cues: [
      'DNA is two strands twisted around each other.',
      'Think of it as a zipper.',
      'Each tooth is a letter: A, T, G or C.',
      'Each letter fits only one partner on the other side.',
    ] },
    { id: 'p03', section: 'An enzyme unzips the helix', title: 'Unzipping', cues: [
      'Copying starts when an enzyme called helicase grabs the helix.',
      { t: 'It pulls the two strands apart.', hold: 0.6 },
      'It breaks the weak bonds between the letters.',
      'Now each strand is a single row of letters, waiting.',
    ] },
    { id: 'p04', section: 'A pairs with T, G pairs with C', title: 'A with T, G with C', cues: [
      'Loose letters drift around inside the cell.',
      'An A only fits a T, held by 2 hydrogen bonds.',
      'A G only fits a C, held by 3.',
      { t: 'So each old strand picks exactly which new letters join.', hold: 0.6 },
    ] },
    { id: 'p05', section: 'One molecule becomes two', title: 'One becomes two', cues: [
      'At the end of the zipper, one molecule has become two.',
      'Each new helix keeps one old strand and one new strand.',
      { t: 'Two exact copies, one for each new cell.', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
