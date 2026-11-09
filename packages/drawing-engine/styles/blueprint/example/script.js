/* Blueprint · benchmark film: gears, an exploded pen, a pipe leak. Drawn to styles/blueprint/GRAMMAR.md; also this style's regression test. */
(function (root) {
  const META = { style: 'blueprint', title: '齿轮为什么能省力', name: 'GEARS', lang: 'zh', gap: 0.6, extras: ['../kit.js'] };
  const PAGES = [
    { id: 'p01', section: '传动比', title: '大齿轮带小齿轮', cues: [
      '左边这个大齿轮，有三十六个齿。',
      '右边的小齿轮，只有十二个。',
      { t: '大的转一圈，小的就要转三圈。', hold: 0.6 },
    ] },
    { id: 'p02', section: '拆开看', title: '一支圆珠笔的五个零件', cues: [
      '把一支按动圆珠笔拆开，',
      '笔帽、弹簧、笔芯、笔杆，还有按钮，',
      { t: '真正决定手感的，是这根小弹簧。', hold: 0.6 },
    ] },
    { id: 'p03', section: '漏点', title: '压力从哪里漏掉', cues: [
      '水从左边进来，流过阀门。',
      '管子在这个弯头处变细了一半，',
      { t: '压力最大的地方，就是最容易漏的地方。', hold: 0.6 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
