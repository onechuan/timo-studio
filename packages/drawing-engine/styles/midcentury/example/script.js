/* Mid-century Cartoon · benchmark film: how to escape a house fire in four steps (zh, 6 pages). Drawn to
 * styles/midcentury/GRAMMAR.md (P.set, P.stepcard, P.presenter, P.thing, P.callout, P.glove, P.tag, P.verdict, P.recap,
 * P.iris); also this style's regression test. */
/* Narration script (the single source of truth): each page is a list of subtitle lines (cues), and the page's animation
 * is timed to cue numbers. A cue is a string, or { t, hold }: hold keeps a few more seconds after the line for the animation.
 * Each page.id maps to pages/<id>.js; a page with no drawing yet shows as a big title. */
(function (root) {
  const META = {
    pace: {"maxHold":1,"gap":0.8},
    voice: {"speaker":"zh_male_yuanboxiaoshu_uranus_bigtts","rate":0,"instruction":"像跟朋友分享一个实用的发现，语气轻松、真诚、自然，有轻重缓急"},
    lang: "zh",
    style: "midcentury",
    title: '家里着火，四步逃出去',     // title of the narration script
    name: '家里着火了怎么逃生：弯腰低姿走、开门前先用手背摸',      // file name prefix of the rendered film
    libs: [],               // third-party libraries (paths under engine_modules, .css or UMD .js), e.g. 'katex/dist/katex.min.js'
    gap: 0.8,               // pause between pages (s); the engine's default is 1.5
    extras: ["engine/styles/midcentury/kit.js"],             // this project's own component files (relative to this folder), loaded before the pages
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
    // ───────────────────────── Opening
    { id: 'p01', section: '开场：先逃还是先打电话', title: '家里着火了，先做什么？',
      instruction: '语速稍快，带点好奇地发问，说到“离开”时干脆有力',
      cues: [
        '家里着火了，第一件事做什么？',
        '很多人会先掏出手机。',
        '其实，先要做的是离开。',
        { t: '记住4个动作，带全家出去。', hold: 0.6 },
      ] },
    // ───────────────────────── Step 1
    { id: 'p02', section: '第1步：弯腰低姿走', title: '弯腰低姿走',
      instruction: '放松平稳，像朋友在身边比划，讲到“弯下腰”时稍放慢',
      cues: [
        '第1步：低姿走。',
        '烟又热又毒，会先往上飘。',
        '所以弯下腰，贴近地面走。',
        '低处的空气更干净。',
        { t: '能用湿毛巾捂住口鼻更好。', hold: 0.6 },
      ] },
    // ───────────────────────── Step 2
    { id: 'p03', section: '第2步：开门前用手背摸门把', title: '先摸门把',
      instruction: '放慢、坚定，这是最关键的一步，“别开”两个字加重',
      cues: [
        '第2步：开门前，先摸门把。',
        '用手背轻轻碰一下，别用手心。',
        '门把烫，说明门外有火，别开！',
        '换一条路走。',
        { t: '不烫，再慢慢打开。', hold: 0.6 },
      ] },
    // ───────────────────────── Step 3
    { id: 'p04', section: '第3步：出门随手关门', title: '随手关门',
      instruction: '稳而清楚，像在叮嘱家人，最后一句带点暖意',
      cues: [
        '第3步：出了门，随手关上。',
        '关着的门，能把烟火挡在屋里。',
        { t: '给全家多争取逃生的时间。', hold: 0.6 },
      ] },
    // ───────────────────────── Step 4
    { id: 'p05', section: '第4步：到了安全的地方再打119', title: '再打119',
      instruction: '沉稳果断，报警内容说得清楚利落，最后一句语气坚决',
      cues: [
        '第4步：到楼外安全处，再打119。',
        '说清地址、什么着火、有没有人困住。',
        '出来了，就别再回去拿东西。',
      ] },
    // ───────────────────────── Recap
    { id: 'p06', section: '回顾：四个动作', title: '四个动作',
      instruction: '平静温和，一字一顿地回顾，结尾像朋友真诚地提醒',
      cues: [
        '低姿走、摸门把、关门、打119。',
        '今晚就和家人把逃生路走一遍。',
        { t: '真出了事，就不会慌。', hold: 1 },
      ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
