/* Isotype · benchmark film: China is getting older. Drawn to styles/isotype/GRAMMAR.md (one figure stands for one amount, quantities are counted rows, figures re-colour and walk between groups); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "isotype",
    title: '中国正在变老',     // title of the narration script
    name: '中国正在变老：1980 年每 10 个人里有 3',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/isotype/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '钩子：1980年，12个干活年纪的人撑一位老人', title: '一位老人身后', instruction: '轻快好奇，像抛出一个问题，最后一句留悬念', cues: [
      '这是一位65岁以上的中国老人。',
      '1980年，他身后约有12个人在干活。',
      { t: '到2050年，这一排还剩几个？', hold: 0.8, solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '1980年：孩子多，老人少', title: '1980年的100个人', instruction: '放松平稳，像摆开一张图慢慢指给朋友看', cues: [
      '把1980年的中国缩成100个人。',
      '其中34个是14岁以下的孩子。',
      '65岁以上的老人，只有5个。',
      { t: '其余61个，正当干活的年纪。', hold: 0.6 },
    ] },
    { id: 'p03', section: '2020年：孩子少了，老人多了', title: '40年后', instruction: '放慢一点，语气更稳，数字一个个落实', cues: [
      '同样这100个人，过了40年。',
      '到2020年，孩子减到18个。',
      { t: '老人从5个，涨到了14个。', hold: 0.8 },
    ] },
    { id: 'p04', section: '2050年：每100人里约30个老人', title: '2050年', instruction: '沉稳有分量，最后一句放慢加重', cues: [
      '再往后看，按联合国的预测，',
      '到2050年，老人约有30个。',
      { t: '差不多每10个人里就有3个。', hold: 0.8 },
    ] },
    { id: 'p05', section: '收尾：撑一位老人的人，从12个到2个', title: '还剩几个', instruction: '平静收尾，不煽情，最后一句轻轻落下', cues: [
      '回到那位老人。',
      '1980年，他身后约有12个人。',
      '2020年，只剩5个左右。',
      { t: '到2050年，大约只有2个了。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
