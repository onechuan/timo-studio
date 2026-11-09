/* Copperplate Engraving · benchmark film: 一片叶子怎样把阳光变成糖 (the leaf cut in section, the stoma, a chloroplast magnified and flooded green, the vein's xylem and phloem). Drawn to styles/engraving/GRAMMAR.md (specimens cut back to front, labels on ruled leaders, a roundel, colour flooding in at the payoff); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "engraving",
    title: '一片叶子怎样造糖',     // title of the narration script
    name: '一片叶子怎样把阳光变成糖：剖开叶片',      // file name prefix of the rendered film
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
    { id: 'p01', section: '钩子：叶子不吃饭，却能自己造糖', title: '叶子自己造糖', instruction: '好奇、轻快，像发现了一件怪事想马上告诉朋友', cues: [
      '一片叶子什么都不吃，却能自己造糖。',
      '它的原料只有阳光、水和空气。',
      { t: '它到底怎么做到的？我们剖开看看。', hold: 0.6 },
    ] },
    { id: 'p02', section: '结构：叶子是一块分层的工厂', title: '叶子的分层', instruction: '放松、平稳，像带朋友一层层往下看，每个名字稍微点一下', cues: [
      '切开以后，叶子其实分好几层。',
      '最上面是一层透明的表皮。',
      '下面是排得整整齐齐的栅栏组织。',
      '再往下是疏松的海绵组织，有很多空隙。',
      { t: '最底层的表皮上，开着一个个小孔。', hold: 0.6 },
    ] },
    { id: 'p03', section: '气孔：叶子的进气口', title: '气孔', instruction: '语速适中，讲清楚开合的道理，"张开"和进出的气体稍加重', cues: [
      '这个小孔叫气孔，是叶子的进气口。',
      '它两边各有一个保卫细胞。',
      '细胞吸水鼓起来，孔就张开了。',
      '空气里的二氧化碳从这里进来。',
      { t: '造糖剩下的氧气和水汽，从这里出去。', hold: 0.6 },
    ] },
    { id: 'p04', section: '叶绿体：真正造糖的地方', title: '叶绿体', instruction: '放慢一点，更笃定，像在揭晓答案，最后的数字一字一顿', cues: [
      '栅栏细胞里，挤满了绿色小颗粒。',
      '它们叫叶绿体，叶子就是靠它造糖。',
      '叶绿体吸收阳光，拿到能量。',
      '它把水拆开，再把二氧化碳拼成糖。',
      { t: '6个二氧化碳加6个水，', hold: 0.3 },
      { t: '造出1个葡萄糖，放出6个氧气。', hold: 0.6 },
    ] },
    { id: 'p05', section: '叶脉：送水进来，运糖出去', title: '叶脉', instruction: '平静温和，节奏舒展，最后一句轻轻落下', cues: [
      '叶脉是叶子里的管道。',
      '一组叫木质部，把根吸来的水送进来。',
      '另一组叫韧皮部，把造好的糖运到全身。',
      { t: '阳光、水和空气，在叶子里变成了糖。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
