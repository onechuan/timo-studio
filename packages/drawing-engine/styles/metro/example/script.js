/* Transit Map · benchmark film: where to go when a cold brings a fever (pharmacy, community clinic, specialist or A&E). Drawn to styles/metro/GRAMMAR.md (every path a coloured line a train draws, stations lighting on their words, one colour per meaning); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "metro",
    title: '发烧了，坐哪条线？',     // title of the narration script
    name: '感冒发烧了该去哪儿看病：药店、社区医院、急诊还是',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/metro/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：发烧了，第一站去哪', title: '发烧了去哪儿', instruction: '好奇、轻快，像抛出一个大家都遇到过的问题，第二句带点疑问', cues: [
      '感冒发烧了，该去哪儿看病？',
      { t: '药店、社区医院、专科还是急诊？', hold: 0.6 },
      '我们把它画成一张地铁图。',
      { t: '起点都是发烧，四条线各通一处。', hold: 0.8 },
    ] },
    { id: 'p02', section: '绿线：普通感冒，先在家休整', title: '绿线：先休息', instruction: '放松、温和，像朋友在宽慰你，说到3天时稍稍加重', cues: [
      '大多数感冒是病毒引起的。',
      '多休息、多喝水，常常自己会好。',
      '难受的话，去药店买点退烧药。',
      '但如果烧了3天还不退，',
      { t: '就该在这里换乘，去医院看看。', hold: 0.6 },
    ] },
    { id: 'p03', section: '蓝线：社区医院先看清楚', title: '蓝线：社区医院', instruction: '放慢一点，平稳清楚，一步一步讲，像在指路', cues: [
      '先坐蓝线，到社区医院。',
      '那里能做血常规，就是抽血化验。',
      '看看是病毒还是细菌感染，',
      '然后医生对症开药。',
      { t: '看不清楚的，会转诊去专科。', hold: 0.6 },
    ] },
    { id: 'p04', section: '红线：这些情况直接急诊', title: '红线：直达急诊', instruction: '更慢、更坚定，语气认真，重音落在症状和120上', cues: [
      '有几种情况，千万别等。',
      '呼吸困难、胸痛、意识不清，',
      '直接去急诊，或者拨打120。',
      '不满3个月的宝宝发烧，',
      { t: '也要马上去医院。', hold: 0.6 },
    ] },
    { id: 'p05', section: '收尾：先看症状，再选线路', title: '你在这里', instruction: '平静、温和地收尾，不说教，最后一句轻轻落下', cues: [
      '下次发烧，先看自己在哪条线上。',
      '绿线、蓝线、紫线，还是红线？',
      '轻症休息，不退看病，危险别等。',
      { t: '选对了线，就少跑冤枉路。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
