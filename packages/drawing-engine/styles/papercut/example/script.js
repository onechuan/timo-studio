/* Red Paper-cut · benchmark film: 春节为什么要贴窗花、倒贴福字、挂红灯笼 (zh, 6 pages). Drawn to styles/papercut/GRAMMAR.md (P.ground,
 * P.flower fold-cut-unfold and glow, P.motif, P.figure, P.strip, P.banner, P.word, P.lanterns); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "papercut",
    title: '一张红纸里的年俗',     // title of the narration script
    name: '春节为什么要贴窗花、倒贴福字、挂红灯笼：一张红纸',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/papercut/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：一张红纸撑起整个年', title: '一张红纸里的年', instruction: '轻快好奇，像跟朋友聊起一件身边的事，最后一句留个悬念', cues: [
      '这期聊聊过年家里那些红东西。',
      '窗花、倒福、红灯笼，你家都有吧？',
      '它们几乎都来自一张红纸。',
      { t: '可为什么偏偏是红纸？', hold: 0.6, solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '为什么是红：传说里年怕红', title: '年怕红', instruction: '放松，像讲一个老故事，语速平稳，最后一句落稳', cues: [
      '民间有个传说，有只怪兽叫年。',
      '它除夕夜出来，最怕红色。',
      '还怕鞭炮的响声和火光。',
      '人们就贴红纸、放鞭炮、点灯火。',
      { t: '红，从此成了过年的颜色。', hold: 0.6 },
    ] },
    { id: 'p03', section: '窗花：把心愿剪进窗户', title: '窗花', instruction: '放慢一点，温暖笃定，把每个吉祥寓意说清楚，最后一句加重', cues: [
      '红纸折起来剪，展开就是团花。',
      '剪的是吉祥图案，鱼是年年有余。',
      '喜鹊上枝头，是喜上眉梢。',
      { t: '贴在窗上，光一透，愿望就亮了。', hold: 0.8 },
    ] },
    { id: 'p04', section: '倒福：倒就是到', title: '倒贴福字', instruction: '放慢、稍坚定，像揭晓答案，落在福到了上，带一点笑意', cues: [
      '福字为什么要倒着贴？',
      '因为倒和到，是同音字。',
      '小孩看见了，会喊一声：福倒了！',
      { t: '听起来，就是福到了。', hold: 0.6 },
    ] },
    { id: 'p05', section: '红灯笼：把团圆点亮', title: '红灯笼', instruction: '舒缓温暖，像看着屋檐下的灯，团圆两个字说得柔一些', cues: [
      '再看屋檐下的红灯笼。',
      '从除夕一直亮到正月十五。',
      { t: '灯是光明，圆灯笼像一家团圆。', hold: 0.6 },
    ] },
    { id: 'p06', section: '收尾：一扇亮着的窗', title: '过年好', instruction: '平静收尾，语速放慢，最后一句轻松自然，像随口的邀请', cues: [
      '红色驱邪，窗花许愿，倒福讨口彩。',
      '中国剪纸在2009年列入人类非遗。',
      { t: '今年过年，不妨自己剪一张。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
