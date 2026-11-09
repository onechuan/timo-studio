/* Manga · benchmark film: deliberate practice (a high-school pianist's epiphany). Drawn to styles/manga/GRAMMAR.md (panels cut in on a P.grid, the protagonist reacting in close-up, the comfort-zone boss with its menace, the realisation splash in the one spot red); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "manga",
    title: '第一百遍的顿悟',     // title of the narration script
    name: '刻意练习：为什么同一首曲子练了一百遍还是弹不好—',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/manga/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '钩子：练了一百遍还是卡住', title: '第一百遍', instruction: '好奇、节奏轻快，像在讲一个身边同学的事，最后一句真心发问', cues: [
      '小林同一首曲子，练了100遍。',
      '可一到那两小节，手指就打结。',
      { t: '练这么多遍，为什么没用？', hold: 0.6 },
      '今天就聊聊，怎么练才有用。',
    ] },
    { id: 'p02', section: '问题：一直待在舒适区', title: '舒适区魔王', instruction: '放松平稳，带一点无奈的同情，“舒适区”三个字稍加重', cues: [
      '他每次都从头弹到尾。',
      '熟的越弹越顺，难的一带而过。',
      { t: '这就是舒适区。', hold: 0.6 },
      '只做已经会的事。',
      '感觉很努力，水平却不动。',
    ] },
    { id: 'p03', section: '顿悟：只练卡住的地方', title: '学习区', instruction: '放慢一点，前两句平静地转述老师的话，到“原来”时像恍然大悟，语气坚定', cues: [
      '老师只说了一句：只练这两小节。',
      '放慢，慢到能弹对为止。',
      { t: '原来，进步发生在学习区。', hold: 1.5 },
      '刚好有点难，必须全神贯注。',
      '那才是真正长本事的地方。',
    ] },
    { id: 'p04', section: '机制：即时反馈', title: '即时反馈', instruction: '稳而清楚，一步一步讲做法，“即时反馈”加重，最后两句放慢', cues: [
      '光练难的还不够。',
      '他用手机录下每一遍。',
      '听完马上改掉一个错音。',
      { t: '这叫即时反馈。', hold: 0.6 },
      '错误刚冒头，就被抓住了。',
      '也就不会被练成习惯。',
    ] },
    { id: 'p05', section: '结尾：刻意练习', title: '下次卡住时', instruction: '平静温和，像朋友收尾时的一句提醒，不说教', cues: [
      '几天后，那两小节终于顺了。',
      '这就是刻意练习。',
      '找到卡点，放慢练，马上听反馈。',
      { t: '下次卡住时，先别从头再来。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
