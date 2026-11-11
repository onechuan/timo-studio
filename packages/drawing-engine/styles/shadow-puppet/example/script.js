/* Shadow Puppetry · benchmark film: 草船借箭 — how Zhuge Liang borrowed 100,000 arrows with straw boats and a fog (zh, 5 pages).
 * Drawn to styles/shadow-puppet/GRAMMAR.md (P.lamp, P.puppet, P.troupe, P.scenery, P.water, P.prop, P.plaque); also this
 * style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "shadow-puppet",
    title: '草船借箭',     // title of the narration script
    name: '草船借箭：诸葛亮怎样算准一场大雾',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/shadow-puppet/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '难题：10天造10万支箭', title: '一道难题', instruction: '好奇又轻快，像讲故事开场，数字说清楚', cues: [
      '这一回，讲草船借箭。',
      '周瑜限他10天，造10万支箭。',
      '诸葛亮却说：只要3天。',
      '还当场立下了军令状。',
      { t: '3天造10万支箭，怎么可能？', solo: { instruction: '真诚地向观众发问，尾音上扬' }, hold: 0.6 },
    ] },
    { id: 'p02', section: '准备：20条草船', title: '二十条草船', instruction: '放松自然，像在一件件清点准备的东西', cues: [
      '诸葛亮根本没打算造箭。',
      '他找鲁肃借了20条小船，',
      '船两边扎满稻草把子，',
      '每船配上30名军士，',
      { t: '再用青布把船身遮住。', hold: 0.6 },
    ] },
    { id: 'p03', section: '算准：第3天的大雾', title: '算准大雾', instruction: '放慢一点，压低声音，像在讲一个秘密，“大雾”加重', cues: [
      '头两天，他什么也没做。',
      '他懂天象，算准第3天夜里有大雾。',
      '四更时分，船队驶向曹营。',
      '鲁肃吓得直发抖，',
      { t: '诸葛亮却在船里饮酒。', hold: 0.6 },
    ] },
    { id: 'p04', section: '借箭：曹操自己送箭', title: '曹操送箭', instruction: '节奏紧凑有力，一步一步讲清因果，最后一句放慢加重', cues: [
      '船上擂鼓呐喊，像要攻营。',
      '曹操怕雾里有埋伏，',
      '不敢出兵，只叫弓箭手放箭。',
      '箭一支支扎进稻草里。',
      '船调个头，另一面也插满了。',
      { t: '箭，是曹操自己送来的。', hold: 1 },
    ] },
    { id: 'p05', section: '收场：10万多支箭', title: '满载而归', instruction: '平静温和，像故事落幕，最后两句稳稳收住', cues: [
      '天亮雾散，船队回营。',
      '一数，10万多支箭。',
      '周瑜只能长叹，自愧不如。',
      '诸葛亮靠的是算准天时，',
      { t: '也算准了曹操的多疑。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
