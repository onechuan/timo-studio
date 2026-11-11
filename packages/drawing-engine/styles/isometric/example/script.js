/* Isometric · benchmark page: how a parcel reaches you. Drawn to styles/isometric/GRAMMAR.md. */
(function (root) {
  const META = {
    style: 'isometric',
    title: '一个包裹的旅程',
    name: '包裹',
    gap: 0.8,
    pace: { maxHold: 1.0, gap: 0.8 },
    extras: ['engine/styles/isometric/kit.js'],
  };
  const PAGES = [
    { id: 'p01', section: '流程', title: '从仓库到你家门口', cues: [
      '你下单的那一刻，仓库里的机器就开始动了。',
      '包裹沿着传送带，被送到分拣中心。',
      '分拣完，装上货车，开往你所在的城市。',
      { t: '最后一公里，由快递员送到你家门口。', hold: 0.6 },
    ] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
