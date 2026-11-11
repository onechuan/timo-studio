/* Clay Studio · benchmark film: why yawns are contagious (zh, 5 pages). Drawn to styles/clay/GRAMMAR.md (P.set, P.buddy,
 * P.prop, P.letters, P.plate, P.coil, P.stack, P.fx); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "clay",
    title: '为什么打哈欠会传染',     // title of the narration script
    name: '为什么打哈欠会传染：给大脑降温、困意信号',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/clay/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：哈欠为什么会一个传一个', title: '哈欠为什么会传染', instruction: '好奇、轻快，像发现了一件有趣的小事，节奏稍快', cues: [
      '这次聊聊，为什么打哈欠会传染。',
      '对面的人打了个哈欠，你很快也张嘴了。',
      '有时只是读到“哈欠”两个字，就想打。',
      { t: '这到底是怎么回事？', hold: 0.6, solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '降温：哈欠像给大脑开窗', title: '给大脑降降温', instruction: '放慢一点，语气笃定，像在揭晓答案，“降温”加重', cues: [
      '大脑工作久了，会慢慢变热。',
      '打哈欠时，你深吸一大口凉空气。',
      '下巴张开，头部血流加快，帮大脑降温。',
      { t: '所以天太热或太冷时，哈欠反而少。', hold: 0.6 },
    ] },
    { id: 'p03', section: '困意信号：该换个状态了', title: '困意信号', instruction: '放松、温和，像在聊日常，语速自然', cues: [
      '我们常在犯困、刚醒或无聊时打哈欠。',
      '哈欠像一个信号：大脑要换状态了。',
      { t: '该提提神，或者该歇一歇了。', hold: 0.6 },
    ] },
    { id: 'p04', section: '传染：大脑在跟着身边人学', title: '大脑在跟着学', instruction: '放慢、更有分量，讲清楚原因，“家人和朋友”加重', cues: [
      '看到别人打哈欠，大脑会跟着动起来。',
      '它在理解对方，也不知不觉模仿。',
      '哈欠在家人和朋友间，传得最快。',
      { t: '在陌生人之间，传得最慢。', hold: 0.6 },
    ] },
    { id: 'p05', section: '结尾：那个哈欠说明你在意他', title: '你在留意身边人', instruction: '平静、温暖，语速放缓，像轻声收尾', cues: [
      '下次被哈欠传染，不用不好意思。',
      '说明你的大脑，正在留意身边的人。',
      { t: '也许它也在提醒你：该休息了。', hold: 0.8 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
