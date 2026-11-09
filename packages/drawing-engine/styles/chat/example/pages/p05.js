ENGINE.visual('p05', (P) => {
  P.ground({ tint: 'alarm' });
  P.title('官方辟谣，撤回已晚', { accent: 'red' });

  const MOM = '紧急通知！明天全城停水，赶紧囤水！';
  const tRecall = P.cw(1, '撤回');

  const chat = P.chat(560, 520, {
    title: '相亲相爱一家人',
    sub: '12 人',
    people: { '妈妈': { color: 'purple' }, '二姨': { color: 'orange' }, '爸爸': { color: 'blue' } },
    messages: [
      { kind: 'time', text: '今天 10:12', at: -4 },
      { from: '二姨', text: '超市矿泉水都快抢光了', at: -3, typing: 0 },
      { from: '爸爸', text: '我刚搬了两箱回来', at: -2, typing: 0 },
      { from: '妈妈', text: MOM, at: -1, typing: 0, recall: tRecall },
      { from: 'me', text: '我也买了三桶😂', at: 1.0 },
      { kind: 'system', text: '官方通知：明天正常供水', at: P.c(2, 0.1) },
      { from: '二姨', typing: true, at: P.c(2, 1.0), until: P.endT + 3 },
    ],
    warn: { at: P.c(0, 0.2), text: '官方辟谣：明天正常供水', sub: '“全城停水”系谣言', tone: 'red' },
  });

  // the lift: mom's forward held up big, then recalled with the original
  const lift = P.say(1330, 400, MOM, { from: '妈妈', fly: chat.spot(3), at: 0.8 });
  P.big(1330, 640, '已撤回', { at: tRecall + 0.3, sub: '可水已经买回家了' });

  // camera: push toward the recalled bubble, then back for the silence
  const [, my] = chat.pos(3, tRecall);
  P.cam([
    P.push(tRecall - 0.4, 640, my, 1.3),
    P.back(P.c(2, -0.1)),
  ]);
});
