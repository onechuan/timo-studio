/* Screencast · benchmark film: three spreadsheet time-savers on a department budget. Drawn to styles/screencast/GRAMMAR.md (one invented app per film, click → zoom → the UI answers → pull back); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "screencast",
    title: '表格里最省时间的三招',     // title of the narration script
    name: '表格里三个最省时间的技巧：冻结首行让表头一直在、',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/screencast/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    { id: 'p01', section: '问题：一张预算表的三件麻烦事', title: '季度预算表', instruction: '轻快一点，带点无奈的好奇，像在说大家都遇到过的麻烦', cues: [
      '季度末，你打开部门预算表。',
      '往下一滚，表头就不见了。',
      '差额这一列，只有第一行有公式。',
      { t: '哪个部门花超了，只能一行行找。', hold: 0.6 },
    ] },
    { id: 'p02', section: '第一招：冻结首行，表头一直在', title: '冻结首行', instruction: '放慢一点，语气笃定，把每个操作说清楚，最后一句加重', cues: [
      '第一招，打开视图菜单。',
      '点一下冻结首行。',
      '再往下滚试试。',
      { t: '表头这一行，始终钉在最上面。', hold: 0.6 },
    ] },
    { id: 'p03', section: '第二招：双击填充柄，公式一键到底', title: '双击填充柄', instruction: '稳一点、慢一点，讲到双击时稍作停顿，结尾带点小惊喜', cues: [
      '第二招，选中第一个差额格子。',
      '公式是实际减预算。',
      '光标移到右下角的小方块。',
      '这叫填充柄，双击它。',
      { t: '公式自己填到最后一行，不用拖。', hold: 0.6 },
    ] },
    { id: 'p04', section: '第三招：条件格式，超预算自动标红', title: '超预算标红', instruction: '语速放缓，清楚地报出每一步，讲到变红时语气上扬', cues: [
      '第三招，选中差额这一列。',
      '点条件格式，选大于，填 0。',
      { t: '花超的格子，立刻变红。', hold: 0.6 },
      '差额大于 0，就是超了预算。',
    ] },
    { id: 'p05', section: '结果：同一张表，一眼看完', title: '一眼看完', instruction: '平静温和，像朋友收尾，不急不赶，最后一句轻轻落下', cues: [
      '回到这张预算表，往下滚。',
      '表头还在，差额一列全有数。',
      '红格子，就是超预算的部门。',
      { t: '三招加起来，不到一分钟。', hold: 1 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
