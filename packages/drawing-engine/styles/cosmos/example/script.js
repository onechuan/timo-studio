/* 3D Cosmos · benchmark film: 光速其实很慢 (the speed of light against the size of space). Drawn to styles/cosmos/GRAMMAR.md (one P.space per page, callouts pinned to bodies, camera moves on cues, the powers-of-ten pull-back on the last page); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    webgl: true,
    webgl: true,
    webgl: true,
    webgl: true,
    vendor: ["three"],
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "cosmos",
    title: '光速其实很慢',     // title of the narration script
    name: '光速其实很慢：从地球出发',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/cosmos/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：光快到一秒绕地球7.5圈', title: '光有多快', instruction: '好奇、轻快，像抛出一个反常识的发现，最后一句稍稍放慢', cues: [
      '光每秒跑30万公里。',
      '一秒钟，能绕地球7.5圈。',
      '可放到宇宙里，它慢得出奇。',
      { t: '我们跟着一束光，走一趟看看。', hold: 0.6 },
    ] },
    { id: 'p02', section: '月球：1.3秒的距离', title: '到月球', instruction: '放松自然，像指着夜空聊天，“1.3秒前”说得轻一点、带点惊奇', cues: [
      '地球到月球，38.44万公里。',
      '光跑过去，要1.3秒。',
      '你抬头看到的月亮，',
      { t: '其实是1.3秒前的样子。', hold: 0.6 },
    ] },
    { id: 'p03', section: '太阳：8分20秒前的阳光', title: '到太阳', instruction: '放慢、沉稳，重音落在“8分20秒”，后两句像认真讲一件有点吓人的事', cues: [
      '太阳离我们1.5亿公里。',
      '阳光要走8分20秒。',
      '要是太阳此刻熄灭，',
      { t: '我们要过8分多钟才知道。', hold: 0.6 },
    ] },
    { id: 'p04', section: '比邻星：4年多的旅程', title: '到最近的恒星', instruction: '更慢一些、语气坚定，“4.2年”加重，最后一句留点余味', cues: [
      '离太阳最近的恒星，叫比邻星。',
      '它的光要走4.2年。',
      '今晚看到它的光，',
      { t: '是4年多前出发的。', hold: 0.6 },
    ] },
    { id: 'p05', section: '银河系：10万年，宇宙更大', title: '穿过银河系', instruction: '平静、开阔，每个数字之间稍作停顿，像镜头一层层拉远，最后一句朴素收住', cues: [
      '把镜头一路拉远。',
      '到月球，1.3秒。',
      '到太阳，8分钟。',
      '到比邻星，4年多。',
      '穿过银河系，要10万年。',
      { t: '光速很快，只是宇宙更大。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
