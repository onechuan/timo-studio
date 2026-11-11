/* Chat Screen · benchmark film: how a 'city-wide water cut tomorrow' rumour spreads in an hour (zh, 6 pages). Drawn to
 * styles/chat/GRAMMAR.md (P.ground, P.chat with recall / warn / zoom, the lift P.say fly, P.feed, P.search, P.inbox, P.big,
 * P.note, P.tag); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "chat",
    title: '一小时，谣言淹了全城',     // title of the narration script
    name: '一条“明天全城停水”的谣言怎样在一小时里传遍全城',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/chat/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '钩子：一条人人都收到过的转发', title: '妈妈转来一条消息',
      instruction: '轻快、带点好奇，像在讲一件刚发生的事，最后一句发问',
      cues: [
      '晚上，家庭群里妈妈转来一句：',
      '明天全城停水，赶紧存水！',
      '没人知道它从哪来，可一小时后，',
      '全城都在传。',
      { t: '它是怎么跑这么快的？', solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '直觉：每个人只多转一个群', title: '宁可信其有',
      instruction: '放松自然，像朋友聊天，语气里带点理解',
      cues: [
      '谁都不想家里断水。',
      '宁可信其有，每人顺手转一个群。',
      '消息就像接力，一棒棒往外跑。',
      { t: '转的人越多，看着越像真的。', hold: 0.6 },
    ] },
    { id: 'p03', section: '机制：截图加“内部消息”，看着更像真的', title: '越转越像真的',
      instruction: '平稳清楚，在“我朋友”和“截图”上稍稍加重',
      cues: [
      '到了朋友圈，它多了一张截图。',
      '还多了一句：我朋友在水务公司。',
      '截图加内部消息，让它更像真的。',
      { t: '点赞和转发数一路往上涨。', hold: 0.6 },
    ] },
    { id: 'p04', section: '放大：热搜让恐慌变成行动', title: '冲上热搜',
      instruction: '节奏稍放慢、语气更坚定，最后一句把数字说重',
      cues: [
      '接着，“停水”冲上了热搜。',
      '搜索框里，联想出“去哪买水”。',
      '超市货架上的水被搬空了。',
      { t: '官方回应时，已有10万人在囤水。', hold: 0.8 },
    ] },
    { id: 'p05', section: '转折：官方辟谣，转发被撤回', title: '官方辟谣',
      instruction: '放慢，像揭晓结果，平静里带一点无奈，最后一句压低加重',
      cues: [
      '官方通知：明天正常供水，停水是谣言。',
      '妈妈撤回了那条消息。',
      { t: '可水，已经买回家了。', hold: 0.8 },
    ] },
    { id: 'p06', section: '收尾：先查官方，再按转发', title: '先查再转',
      instruction: '平静温和，像给朋友一句实在的建议，不说教',
      cues: [
      '下次再收到这种消息，',
      '先查官方通知，再决定转不转。',
      '你少转一次，',
      { t: '谣言就少跑一程。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
