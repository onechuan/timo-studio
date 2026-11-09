/* Antique Map · benchmark film: 麦哲伦船队第一次环游世界 (the world plate, the Atlantic crossing, the strait at the end of South America, the Pacific, the route closing round the globe). Drawn to styles/old-map/GRAMMAR.md (P.region first, routes inked while the ship sails, places named on the word, the year turning in the cartouche); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "old-map",
    title: '麦哲伦船队环游世界',     // title of the narration script
    name: '麦哲伦船队第一次环游世界：1519年五条船从西班',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["../kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：五条船出发，一条船回来', title: '五条船出发', instruction: '好奇、轻快，像讲一个反常的事实，“18个人”稍加重', cues: [
      '1519年，五条船从西班牙出发。',
      '三年后，只有一条船、18个人回来。',
      '他们第一次绕着地球走了一整圈。',
      { t: '这一圈是怎么走下来的？', hold: 0.6, solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '横渡大西洋：一路向西，再向南', title: '横渡大西洋', instruction: '放松平稳，像在地图上指着路线慢慢讲', cues: [
      '船队从西班牙起航，一路向西。',
      '先到加那利群岛，再横渡到巴西。',
      '然后沿着南美海岸一直往南，',
      { t: '找一条通往另一片海洋的水道。', hold: 0.6 },
    ] },
    { id: 'p03', section: '南美尽头的海峡', title: '找到海峡', instruction: '放慢、更坚定，这是全片关键，“38天”和最后一句加重', cues: [
      '1520年，他们在南美尽头找到海峡。',
      '水道又窄又曲折，他们走了38天。',
      '一条船早已触礁，一条掉头回国。',
      '剩下三条船出了海峡，海面很平静。',
      { t: '麦哲伦叫它“太平洋”。', hold: 0.8 },
    ] },
    { id: 'p04', section: '横渡太平洋', title: '横渡太平洋', instruction: '语速放慢，带一点沉重，讲到麦哲伦之死时压低', cues: [
      '太平洋上，几个月看不见陆地。',
      '1521年，他们终于到了菲律宾。',
      '麦哲伦在当地一场战斗中死去。',
      { t: '船队只剩两条船，继续往前。', hold: 0.6 },
    ] },
    { id: 'p05', section: '回到西班牙', title: '一整圈', instruction: '平静、踏实，像把故事轻轻收住，最后一句简单有分量', cues: [
      '只剩维多利亚号，向西绕过好望角。',
      '1522年，18个人回到西班牙。',
      { t: '这是人类第一次环游地球一周。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
