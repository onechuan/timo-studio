/* 3D Exploded View · benchmark film: 喷气发动机怎么把空气变成推力 (fan, compressor, combustor, turbine, nozzle; turn, explode, cutaway, highlight, flow, reassemble). Drawn to styles/exploded/GRAMMAR.md; also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    webgl: true,
    vendor: ["three"],
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "exploded",
    title: '一口空气，怎么变成推力',     // title of the narration script
    name: '喷气发动机怎么把空气变成推力：风扇、压气机、燃烧',      // file name prefix of the rendered film
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
    { id: 'p01', section: '开场：几百吨的飞机靠什么往前走', title: '一口空气，怎么变成推力', instruction: '好奇、轻快，像抛出一个有意思的问题，节奏稍快', cues: [
      '几百吨重的客机，靠什么往前走？',
      '答案挂在翅膀下面：喷气发动机。',
      '前面吸进空气，后面更快地喷出去。',
      { t: '今天就跟着一口空气走一遍。', hold: 0.6 },
    ] },
    { id: 'p02', section: '拆开：一口空气要走过五个部件', title: '五站', instruction: '放松、清楚，像带朋友认路，每个部件名字稍作停顿', cues: [
      '我们把它沿着中轴拆开。',
      '空气先过风扇，再进压气机。',
      '然后是燃烧室、涡轮和尾喷口。',
      { t: '五站，每一站只干一件事。', hold: 0.8 },
    ] },
    { id: 'p03', section: '压缩：空气被一级级挤紧', title: '压紧', instruction: '放慢一点，语气笃定，重音落在40倍上', cues: [
      '第一站是风扇，把大口空气拉进来。',
      '一部分空气钻进压气机。',
      '一排排叶片把它一级级挤紧。',
      { t: '大发动机能压到原来的40倍左右。', hold: 0.6 },
    ] },
    { id: 'p04', section: '燃烧：挤紧的空气和燃油一起烧', title: '点燃', instruction: '沉稳有力，慢一点，温度那句加重', cues: [
      '我们把发动机切开看看里面。',
      '压紧的空气进入燃烧室。',
      '燃油喷进来，和空气一起持续燃烧。',
      '燃气温度能超过1500度。',
      { t: '它体积猛涨，拼命往后冲。', hold: 0.6 },
    ] },
    { id: 'p05', section: '涡轮：热气顺手把风扇转起来', title: '涡轮', instruction: '轻松一点，像揭开一个巧妙的安排，语气带点恍然', cues: [
      '往后冲的热气，先吹过涡轮。',
      '涡轮和风扇装在同一根轴上。',
      '涡轮一转，风扇和压气机就跟着转。',
      { t: '前面就一直有力气吸气、压气。', hold: 0.6 },
    ] },
    { id: 'p06', section: '收尾：往后喷得越快，往前推得越猛', title: '推力', instruction: '平静、温和，节奏放缓，最后一句简单收住', cues: [
      '最后，气体从尾喷口高速喷出。',
      '把空气往后推，就得到向前的推力。',
      { t: '一口空气走完五站，飞机前进一点。', hold: 1.0 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
