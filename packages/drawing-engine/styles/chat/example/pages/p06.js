ENGINE.visual('p06', (P) => {
  P.ground({ tint: 'mint' });
  P.title('先查官方，再按转发', { accent: 'green' });

  const tMe = P.c(1, -0.25);
  const tStop = P.cw(1, '转不转');

  const chat = P.chat(560, 520, {
    title: '相亲相爱一家人',
    sub: '12 人',
    people: { '三姨': { color: 'orange' }, '大舅': { color: 'blue' } },
    messages: [
      { kind: 'time', text: '今天 08:12', at: 0 },
      { from: '三姨', text: '紧急通知！明天全城停水，快囤水！转给家人！', at: 0.1, typing: 0,
        hl: 'red', hlAt: P.c(2, 0) },
      { from: '大舅', text: '真的假的？要不要转？', at: P.c(0, 0.5), typing: 0.8 },
      { from: 'me', text: '先查官方通知，别急着转', at: tMe, typed: true },
      { kind: 'system', text: '你取消了转发', at: tStop, zoom: 1.5, zoomOut: P.c(2, -0.1) },
      { kind: 'system', text: '这条消息停在了你这里', at: P.c(3, 0.3) },
    ],
  });

  P.say(1330, 400, '先查官方通知，别急着转', { from: 'me', fly: chat.spot(3), at: tMe + 0.6 });

  P.big(1330, 660, '谣言', { color: 'red', w: 560, sub: '少转一次，它就少跑一程', at: P.c(2, 0.4) });
});
