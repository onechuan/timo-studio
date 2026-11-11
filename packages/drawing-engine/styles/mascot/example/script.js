/* Mascot Explainer · benchmark film: is a gym membership worth it (en, 6 pages). Drawn to styles/mascot/GRAMMAR.md
 * (P.mascot, P.pouch, P.bignum, P.calc, P.barchart, P.pricetag, P.receipt, P.stamp, P.calendar, P.coin); also this
 * style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"EXAVITQu4vr4xnSDxMaL","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "en",
    style: "mascot",
    title: 'Is a Gym Membership Worth It?',     // title of the narration script
    name: 'Is a gym membership worth it',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/mascot/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: 'Hook: $50 a month or $12 a visit?', title: 'Is a gym membership worth it?', cues: [
      'A gym membership costs 50 dollars a month.',
      'A drop-in pass costs 12 dollars a visit.',
      'So which one is actually cheaper for you?',
      { t: 'It comes down to how often you really go.', hold: 0.6 },
    ] },
    { id: 'p02', section: 'Rule: divide the fee by your visits', title: 'What one visit really costs', cues: [
      'Split the 50 dollars by the visits you make.',
      'Go 2 times a month, and each visit costs 25 dollars.',
      'Go 4 times, and it drops to 12 dollars 50.',
      { t: 'That is about the same as a drop-in pass.', hold: 0.6 },
    ] },
    { id: 'p03', section: 'Pattern: the more you go, the cheaper each visit', title: 'The more you go, the cheaper', cues: [
      'Go 8 times a month, and a visit costs 6 dollars 25.',
      'Go 12 times, and it is about 4 dollars 17.',
      { t: 'The membership pays off for regulars.', hold: 0.6 },
    ] },
    { id: 'p04', section: 'Break-even: 5 visits a month', title: 'The break-even point', cues: [
      '4 drop-ins cost 48 dollars, still under 50.',
      '5 drop-ins cost 60 dollars, more than the membership.',
      'The membership stays at 50 dollars either way.',
      { t: 'So 5 visits a month is where it breaks even.', hold: 0.8 },
    ] },
    { id: 'p05', section: 'Catch: the January trap', title: 'The January trap', cues: [
      'Now the trap: signing up for a whole year in January.',
      'By March, plenty of people stop going.',
      'At 50 dollars a month, a year costs 600 dollars.',
      'Stop by March, and 10 months, 500 dollars, go to waste.',
      { t: 'You paid for a gym you no longer visit.', hold: 0.6 },
    ] },
    { id: 'p06', section: 'Close: count your visits first', title: 'Your checklist', cues: [
      'So first, count your real visits for one month.',
      '5 or more a month? Get the membership.',
      'Fewer than 5? Keep paying 12 dollars a visit.',
      { t: 'Let your own number decide.', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
