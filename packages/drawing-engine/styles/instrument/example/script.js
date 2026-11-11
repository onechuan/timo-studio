/* Instrument · benchmark film: 汽车发动机是怎么转起来的. Drawn to styles/instrument/GRAMMAR.md (the real machine, a four-cylinder
 * engine cut open: crank, rods and pistons from S.crank, a timing belt, the spark as the one S.glow; parts named with S.key; every
 * number read from the P.track that moves the parts); also this style's regression test. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "instrument",
    title: '发动机是怎么转起来的',     // title of the narration script
    name: '汽车发动机是怎么转起来的：进气、压缩、做功、排气',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/instrument/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '开场：活塞上下跑，车轮却在转', title: '上下变转圈', instruction: '好奇、轻快，像抛出一个有意思的问题，最后一句稍微放慢', cues: [
      '发动机里的活塞，只会上下跑。',
      '可车轮却是在转圈。',
      '答案就藏在这台4缸发动机里。',
      { t: '它把上下，变成了转圈。', hold: 0.6 },
    ] },
    { id: 'p02', section: '四个冲程：吸气、压紧、爆发、排出', title: '四个冲程', instruction: '放松自然，一步一步讲清楚，每个冲程的名字稍微点一下', cues: [
      '一个气缸干活，分四步。',
      '进气：活塞下行，吸进油和气。',
      '压缩：活塞上行，把它压紧。',
      '做功：混合气燃烧，推下活塞。',
      { t: '排气：活塞再上来，挤出废气。', hold: 0.6 },
    ] },
    { id: 'p03', section: '点火：火花塞一闪，活塞被推下去', title: '火花塞点火', instruction: '放慢、更笃定，这是关键页，最后一句加重', cues: [
      '关键就在做功这一步。',
      '活塞压到最紧时，火花塞打火。',
      '混合气猛地膨胀，把活塞推下去。',
      { t: '四步里，只有这一步在出力。', hold: 0.6 },
    ] },
    { id: 'p04', section: '曲轴：把上下变成转圈', title: '曲轴', instruction: '轻松清楚，像在比划给朋友看，数字说得清楚稳当', cues: [
      '活塞通过连杆，连着曲轴拐弯处。',
      '活塞往下推，拐弯就跟着绕圈。',
      '每个冲程，曲轴转半圈，180度。',
      { t: '四个冲程走完，曲轴转了2圈。', hold: 0.6 },
    ] },
    { id: 'p05', section: '正时皮带：让气门踩准节拍', title: '正时皮带', instruction: '稍慢、笃定，重点落在2圈对1圈上', cues: [
      '气门啥时候开，听凸轮轴的。',
      '正时皮带连着曲轴和凸轮轴。',
      '凸轮轴的带轮，大一倍。',
      '曲轴转2圈，凸轮轴只转1圈。',
      { t: '每个气门正好开一次，不乱拍。', hold: 0.6 },
    ] },
    { id: 'p06', section: '合起来：四个缸轮流出力', title: '轮流出力', instruction: '平静温和地收尾，不说教，最后一句简单落地', cues: [
      '四个气缸错开节拍，轮流做功。',
      '曲轴每转半圈，就有一缸推它。',
      '所以它转得又稳又连贯。',
      { t: '踩油门时，四个活塞在轮流用力。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
