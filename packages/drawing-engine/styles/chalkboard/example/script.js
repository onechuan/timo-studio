/* Chalkboard · benchmark film: the Pythagorean theorem. Drawn to styles/chalkboard/GRAMMAR.md (board work derived step by step, the conclusion boxed); also this style's regression test. */
(function (root) {
  const META = {
    style: 'chalkboard',
    title: '勾股定理：勾三股四弦五',
    name: '勾股定理',
    gap: 0.7,
    pace: { maxHold: 0.9, gap: 0.7 },
  };
  const PAGES = [
    { id: 'p01', section: '开场', title: '斜边有多长？', cues: [
      '黑板上有一个直角三角形。',
      '两条直角边，一条是三，一条是四。',
      { t: '那斜边有多长？', hold: 0.6 },
    ] },
    { id: 'p02', section: '画正方形', title: '每条边一个正方形', cues: [
      '在每条直角边上画一个正方形。',
      '短边上的正方形，三乘三，是九格。',
      { t: '长边上的，四乘四，是十六格。', hold: 0.4 },
    ] },
    { id: 'p03', section: '搬格子', title: '九加十六', cues: [
      '把这些格子一格一格搬过去，',
      '九格加十六格，',
      '正好铺满一个二十五格的正方形。',
      { t: '五乘五，所以斜边是五。', hold: 0.5 },
    ] },
    { id: 'p04', section: '定理', title: '换成字母', cues: [
      '把三、四、五换成字母，',
      '直角边是 a 和 b，斜边是 c，',
      { t: 'a 方加 b 方，等于 c 方。', hold: 0.6 },
    ] },
    { id: 'p05', section: '收束', title: '勾三股四弦五', cues: [
      '两千多年前的《周髀算经》里，',
      '就写着勾三股四弦五。',
      { t: '说的就是黑板上这个三角形。', hold: 0.8 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
