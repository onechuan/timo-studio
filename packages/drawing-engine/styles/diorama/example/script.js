/* 3D Miniature City · benchmark film: why new roads fill up (induced demand). Drawn to styles/diorama/GRAMMAR.md (one tilt-shift model of one place, traffic always moving, flags and placards only); also this style's regression test.
 * Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    webgl: true,
    vendor: ["three"],
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "diorama",
    title: '为什么路越修越堵',     // title of the narration script
    name: '为什么路越修越堵：一条新修的高速',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/diorama/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：新高速三年后又堵满', title: '新高速，三年又堵', instruction: '轻快一点，带着好奇，像在讲一件反常的事', cues: [
      '城外新修了一条高速。',
      '通车那天，车跑得飞快。',
      { t: '可三年后，它又堵满了。', hold: 0.8 },
      { t: '路修多了，为什么没变快？', solo: { instruction: '真诚地发问，尾音上扬' } },
    ] },
    { id: 'p02', section: '直觉：路快了，开车就便宜了', title: '开车打了折', instruction: '放松自然，像跟朋友聊身边的事，不急', cues: [
      '原本很多人坐火车进城。',
      '路一通，不少人改开车。',
      '原本不出门的，也开车出门了。',
      { t: '开车省下的时间，像打了折。', hold: 0.6 },
    ] },
    { id: 'p03', section: '机制：人们搬得更远、走得更多', title: '住得更远', instruction: '稍慢一点，一步一步讲清楚因果，最后一句落稳', cues: [
      '高速沿线，原本是空地。',
      '通勤快了，人就敢住得更远。',
      { t: '新的住宅区一片片长出来。', hold: 0.8 },
      '每一户，都要开车进城。',
      { t: '多出来的路，就这样被填满。', hold: 0.6 },
    ] },
    { id: 'p04', section: '数字：路多1%，车也多1%', title: '道路拥堵的基本定律', instruction: '放慢、坚定，像在揭晓答案，重音落在两个1%上', cues: [
      '经济学家查了美国几十年数据。',
      { t: '路多1%，开车也多约1%。', hold: 0.6 },
      '这叫道路拥堵的基本定律。',
      { t: '光靠加宽，追不上新增的车。', hold: 0.6 },
    ] },
    { id: 'p05', section: '收尾：管住需求，比加宽更有用', title: '让路松下来', instruction: '平静温和，说得实在，结尾简单收住', cues: [
      '有用的，是让开车付出成本。',
      '再给人们又快又准的火车。',
      { t: '火车跑起来，高速才松得开。', hold: 0.6 },
      { t: '路堵不堵，看有多少人要走。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
