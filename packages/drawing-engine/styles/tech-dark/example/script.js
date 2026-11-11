/* Tech dark · benchmark film: caching. Drawn to styles/tech-dark/GRAMMAR.md (a clean architecture diagram, requests really flowing along paths, teal the only accent); also this style's regression test. */
(function (root) {
  const META = {
    style: 'tech-dark',
    title: '缓存：为什么第二次打开更快',
    name: '缓存',
    gap: 0.6,
    extras: ['net.js'],   // the browser / cache / origin diagram shared by every page
  };
  const PAGES = [
    { id: 'p01', section: '开场', title: '一来一回 120 ms', cues: [
      '你打开一个网页，',
      '请求要一路跑到很远的源站，',
      { t: '一来一回，要一百二十毫秒。', hold: 0.5 },
    ] },
    { id: 'p02', section: '未命中', title: '中间放一个缓存', cues: [
      '在中间放一个缓存。',
      '第一次请求，缓存里没有，还是要去源站。',
      { t: '回来的路上，缓存顺手存一份副本。', hold: 0.4 },
    ] },
    { id: 'p03', section: '命中', title: '第二次：5 ms', cues: [
      '第二次请求同一个页面，',
      '缓存里已经有了，',
      { t: '五毫秒就返回，不用再去源站。', hold: 0.5 },
    ] },
    { id: 'p04', section: '过期', title: '副本会过期', cues: [
      '但副本不会一直有效。',
      '响应头里写着它能存多久，三千六百秒。',
      { t: '到期之后，下一次请求重新回源。', hold: 0.5 },
    ] },
    { id: 'p05', section: '收束', title: '源站只接少数请求', cues: [
      '一百个请求里，',
      '大部分在缓存这里就折返了，',
      { t: '源站只需要处理剩下的那几个。', hold: 0.8 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
