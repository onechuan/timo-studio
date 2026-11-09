/* Inked · benchmark film: how a pop-up toaster knows when the toast is done. Drawn to styles/inked/GRAMMAR.md (one
 * object big on warm paper, step pills pressed on the word, the working part's tag lit, the stat reading the variable that
 * moves the drawing); also this style's regression test. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    lang: "en",
    style: "inked",
    title: 'How a Toaster Knows',     // title of the narration script
    name: 'How a pop-up toaster knows when your',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/inked/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: 'Nobody watches the toast', title: 'Nobody Watches', cues: [
      'You drop the bread in, push it down, and walk away.',
      'Nobody is watching, yet it pops up right on time.',
      'The answer is waiting inside the slot.',
      { t: 'So how does a toaster know when to stop?', hold: 0.6 },
    ] },
    { id: 'p02', section: 'The lever locks the bread down', title: 'Push and Latch', cues: [
      'Pushing the lever lowers a little tray, called the carriage.',
      'At the bottom, a hook catches it against a spring.',
      'The same push closes a switch, and current starts flowing.',
      { t: 'The green light tells you it is on.', hold: 0.6 },
    ] },
    { id: 'p03', section: 'Wires that glow red', title: 'The Glowing Wires', cues: [
      'Beside each slice, thin nichrome wire is wound on flat sheets.',
      'It resists the current, so it heats up until it glows.',
      'That red glow browns the surface of the bread.',
      { t: 'Nichrome is a wire made to get hot without burning out.', hold: 0.6 },
    ] },
    { id: 'p04', section: 'A strip that bends with heat', title: 'The Bending Strip', cues: [
      'Next to the wires sits a bimetal strip: two metals bonded together.',
      'Warmed, one metal stretches more, so the strip starts to curl.',
      'The browning dial sets how far it must curl.',
      { t: 'Darker toast means a longer bend, and more time.', hold: 0.6 },
    ] },
    { id: 'p05', section: 'The latch lets go', title: 'Pop', cues: [
      'When the strip curls far enough, it nudges the hook aside.',
      'The spring yanks the tray up, and the wires go dark.',
      { t: 'Your toast pops up, timed by metal that felt the heat.', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
