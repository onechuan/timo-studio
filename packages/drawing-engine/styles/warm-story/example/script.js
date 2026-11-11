/* Warm story illustration · benchmark film: compound interest. Drawn to styles/warm-story/GRAMMAR.md; also this style's regression test. */
(function (root) {
  const META = {
    style: 'warm-story',
    title: '复利：时间比本金更重要',
    name: '复利',
    gap: 0.8,
    // calm pace for this style: hold a beat longer after a sentence, and a little more before a page turns
    pace: { maxHold: 1.0, gap: 0.8 },
    extras: ['engine/lib/warm.js'],
  };
  const PAGES = [
    { id: 'p01', section: '开场', title: '三十年后有多少？', cues: [
      '假设你每个月存一千块。',
      '就这样坚持三十年，',
      { t: '最后能有多少钱？', hold: 0.6 },
    ] },
    { id: 'p02', section: '只存不投', title: '一枚一枚地变多', cues: [
      '如果只是把钱存起来，',
      '三十年一共存了三十六万。',
      '钱是一枚一枚变多的。',
    ] },
    { id: 'p03', section: '复利', title: '收益也会生钱', cues: [
      '换一种存法。',
      '每年拿到的收益，',
      '第二年也开始帮你生钱。',
      '就像滚雪球，',
      { t: '越往后滚得越快。', hold: 0.4 },
    ] },
    { id: 'p04', section: '对比', title: '差了四倍多', cues: [
      '同样每月一千，',
      '按每年百分之八的收益算，',
      '三十年后大约是一百四十九万。',
      { t: '是只存不投的四倍多。', hold: 0.5 },
    ] },
    { id: 'p05', section: '时间', title: '增长都在后面', cues: [
      '而且大部分增长，',
      '都发生在最后十年。',
      '前十年只攒了十八万，',
      { t: '最后十年却涨了九十万。', hold: 0.5 },
    ] },
    { id: 'p06', section: '收束', title: '越早开始越好', cues: [
      '所以复利最看重的，',
      '是时间。',
      '越早开始，',
      { t: '雪球就有越长的坡可以滚。', hold: 0.8 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
