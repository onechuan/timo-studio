ENGINE.visual('p04', (P) => {
  P.set('lilac');
  P.title('传染：大脑在跟着学', { accent: 'purple' });

  const c0 = P.c(0), c1 = P.c(1), c2 = P.c(2), c3 = P.c(3);
  const yawn = c0 + 0.4;

  // 你：左边，橙色，蓝色毛线帽
  P.buddy(360, 870, {
    size: 440, body: 'orange', hat: 'beanie', accent: 'blue', face: 'r', at: 0,
    pose: [[0, 'idle'], [c0 + 1.8, 'surprised'], [c1 + 0.2, 'sleepy'], [c2, 'point'], [c3, 'cheer']],
    mood: [[0, 'happy'], [c0 + 1.8, 'think'], [c1 + 0.2, 'shock'], [c2, 'happy'], [c3, 'laugh']],
  });

  // 朋友：右边，蓝色，眼镜 + 黄色帽子
  P.buddy(1560, 870, {
    size: 440, body: 'blue', hat: 'cap', accent: 'yellow', glasses: true, face: 'l', at: 0,
    pose: [[0, 'idle'], [yawn, 'sleepy'], [c1 + 0.6, 'idle'], [c2, 'wave'], [c3, 'cheer']],
    mood: [[0, 'happy'], [yawn, 'shock'], [c1 + 0.6, 'happy'], [c3, 'laugh']],
  });
  P.fx('puff', 1440, 560, { at: yawn + 0.2 });

  // 哈欠彩条：从朋友嘴边卷向你
  P.coil([[1420, 560], [1150, 380], [800, 360], [520, 540]], {
    color: 'purple', width: 28, end: 'arrow', at: yawn + 0.4, dur: 1.2, out: c2 - 0.2,
  });

  // 你跟着打哈欠
  P.fx('exclaim', 470, 380, { at: c0 + 1.8, out: c1 });
  P.plate(760, 300, 420, 92, '不知不觉模仿', { color: 'yellow', tail: [520, 470], at: c1 + 0.3, out: c2 - 0.1 });

  P.cam([P.push(c1 + 0.1, 880, 560, 1.12), P.back(c2)]);

  // 三根积木柱：家人最高
  P.stack(900, 860, [
    { v: 6, label: '家人', color: 'red' },
    { v: 4, label: '朋友', color: 'yellow' },
    { v: 1, label: '陌生人', color: 'paper' },
  ], { unit: 1, block: 80, gap: 110, at: P.cw(2, '家人'), stagger: 0.12, hi: 0, valueSize: 72 });

  // 爱心在两人之间蹦出来
  P.prop('heart', 1240, 300, { size: 230, float: true, face: true, mood: 'happy', color: 'red', at: c3 + 0.3 });
  P.fx('hearts', 1240, 220, { at: c3 + 0.5, dur: 1.6 });
});
