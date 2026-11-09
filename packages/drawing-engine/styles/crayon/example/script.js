/* Crayon Picture Book · benchmark film: why the moon changes shape (zh, 6 pages). Drawn to styles/crayon/GRAMMAR.md (P.sky,
 * P.ground, P.kid, P.sun, P.moon, P.thing, P.crayon, P.lines, P.words, P.note, P.twinkle); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "crayon",
    title: '月亮为什么会变形状',     // title of the narration script
    name: '月亮为什么会变形状：月亮自己不发光',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/crayon/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '月亮为什么会变形状', title: '月亮会变形状', instruction: '像睡前讲故事，轻柔又好奇，语速稍快一点，最后一问带着惊奇', cues: [
      '今晚我们来聊聊天上的月亮。',
      '前几天，朵朵看到月亮弯弯的，',
      '今天晚上，月亮却圆圆的。',
      { t: '月亮为什么会变形状呢？', hold: 0.6 },
    ] },
    { id: 'p02', section: '月亮自己不发光', title: '月亮自己不发光', instruction: '轻松温柔，像在床边陪孩子玩，说到“亮”时带一点开心', cues: [
      '这个皮球，在黑黑的房间里看不见。',
      '月亮也一样，自己不会发光。',
      '朵朵拿起手电筒，照向皮球。',
      { t: '被照到的那一半，就亮了！', hold: 0.6 },
    ] },
    { id: 'p03', section: '太阳照亮月亮的一半', title: '太阳照亮一半', instruction: '放慢一点，温柔而肯定，“一半亮，一半黑”要说得清楚有分量', cues: [
      '天上也有一个大大的手电筒。',
      '它就是暖暖的太阳。',
      '太阳的光照在月亮上，',
      { t: '月亮总是一半亮，一半黑。', hold: 0.6 },
    ] },
    { id: 'p04', section: '月亮绕着地球转', title: '月亮绕着地球转', instruction: '慢慢地、一字一句地讲，像揭晓秘密，最后一句加重', cues: [
      '我们住在地球上。',
      '月亮呢，绕着地球转圈圈。',
      '它转到不同的地方，亮面就不一样。',
      { t: '所以我们每晚看到的月亮都不同。', hold: 0.6 },
    ] },
    { id: 'p05', section: '从月牙到满月', title: '从月牙到满月', instruction: '轻快一点，像数数一样有节奏，说到满月时开心，最后一句放慢', cues: [
      '先是弯弯的月牙，',
      '再变成半个月亮，',
      '然后是圆圆的满月！',
      '满月又一点点变瘦，变回月牙。',
      { t: '大约一个月，月亮转完一圈。', hold: 0.6 },
    ] },
    { id: 'p06', section: '晚安，月亮', title: '晚安，月亮', instruction: '非常安静柔和，像哄孩子入睡，越说越轻越慢', cues: [
      '月亮其实没有变，只是亮面不一样。',
      '今晚抬头看看，月亮是什么样子？',
      { t: '晚安，月亮。晚安，朵朵。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
