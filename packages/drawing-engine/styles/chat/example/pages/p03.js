ENGINE.visual('p03', (P) => {
  P.ground({ tint: 'peach' });
  P.title('截图加一句“内部消息”', { accent: 'orange' });

  const tPost = P.c(0, 0.5);
  const tLine = P.cw(1, '我朋友');
  const tGrow = P.c(3, -0.6);

  const feed = P.feed(560, 520, {
    at: 0,
    title: '朋友圈',
    posts: [
      { name: '小林', text: '周末带娃去公园，天气真好～', image: 'photo', likes: 23, comments: 4, shares: 0, at: 0 },
      {
        name: '阿芳',
        text: '明天全城停水！**我朋友在水务公司**，内部消息，赶紧存水！',
        image: 'screenshot',
        likes: [8, 4860], comments: [2, 912], shares: [3, 3270],
        grow: [tGrow, P.endT + 0.6],
        at: tPost,
      },
    ],
  });

  // camera pushes onto the caption as the narration says it
  // the lifted key line (stays all page)
  P.say(1330, 300, '我朋友在水务公司，内部消息', { from: '阿芳', typing: 0, at: P.c(0, 1.4) });

  // the note, then swapped for the share count
  const L1 = P.layer();
  L1.note(1330, 560, '其实只是**听说的**', {
    kicker: '截图＋内部消息', color: 'orange', at: P.cw(1, '水务', 0.4),
  });
  const L2 = P.layer();
  const tSwap = P.c(3, -0.7);
  P.tick((lt) => {
    const k = Math.min(1, Math.max(0, (lt - tSwap) / 0.4));
    L1.wrap.style.opacity = String(1 - k);
  });
  L2.big(1330, 600, null, {
    count: [3, 3270], unit: '次转发', dur: Math.max(1.5, P.endT - tGrow),
    at: tGrow, color: 'orange', sub: '越转越真',
  });
});
