/* Whiteboard sketch · benchmark film: the Pomodoro Technique. Drawn to styles/whiteboard/GRAMMAR.md (drawn with a marker while talking, colour markers only for emphasis); also this style's regression test. */
(function (root) {
  const META = {
    style: 'whiteboard',
    title: '番茄工作法：一次只做一件事',
    name: '番茄工作法',
    gap: 0.6,
  };
  const PAGES = [
    { id: 'p01', section: '开场', title: '一个下午去哪了？', cues: [
      '一个下午坐在桌前，',
      '消息一条接一条地进来，',
      { t: '为什么清单上一件都没做完？', hold: 0.6 },
    ] },
    { id: 'p02', section: '一个番茄', title: '二十五分钟，一件事', cues: [
      '番茄工作法只要求一件事：',
      '定一个二十五分钟的计时器，',
      { t: '这段时间里，只做清单上的一件事。', hold: 0.4 },
    ] },
    { id: 'p03', section: '休息', title: '四个番茄，一次长休', cues: [
      '计时器响了，就休息五分钟。',
      '每做完四个番茄，',
      { t: '就休息久一点，十五到三十分钟。', hold: 0.5 },
    ] },
    { id: 'p04', section: '被打断', title: '先记下来', cues: [
      '中途有人找你，',
      '先把这件事记在纸上，',
      { t: '等这个番茄走完，再去处理。', hold: 0.5 },
    ] },
    { id: 'p05', section: '收束', title: '一件一件做完', cues: [
      '一个下午，四个番茄，',
      '每个番茄只做一件事，',
      { t: '清单就是这样一件一件划掉的。', hold: 0.8 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
