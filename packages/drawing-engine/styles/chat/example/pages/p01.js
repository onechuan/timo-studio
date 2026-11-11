ENGINE.visual('p01', (P) => {
  P.ground({ tint: 'night' });
  P.title('一条人人都收到的转发', { accent: 'orange' });

  const KEY = '【转发】明天全城停水，赶紧存水！';
  const tKey = P.c(0, 1.6);

  const chat = P.chat(560, 520, {
    title: '相亲相爱一家人',
    sub: '6 人',
    people: {
      '妈妈': { color: 'orange' },
      '爸爸': { color: 'blue' },
      '二姨': { color: 'purple' },
      '小舅': { color: 'blue' },
      '表姐': { color: 'purple' },
    },
    messages: [
      { kind: 'time', text: '21:06', at: 0.2 },
      { from: '爸爸', text: '都吃过饭了没？', at: 0.9, typing: 0 },
      { from: '妈妈', text: KEY, at: tKey, typing: 1.0, zoom: true, zoomOut: tKey + 0.7, hl: true, hlAt: tKey + 0.5 },
      { from: '二姨', text: '收到！', at: P.c(2, 0.4) },
      { from: '小舅', text: '已转', at: P.cw(2, '一小时', 0.1) },
      { from: '表姐', text: '已转小区群了', at: P.c(3, 0.2) },
      { from: '二姨', text: '我也转了三个群', at: P.c(3, 1.1) },
      { from: '小舅', text: '超市已经在排队买水了', at: P.c(4, 0.3) },
    ],
  });

  // The lift: the forwarded line rises out of the phone
  P.say(1330, 400, KEY, { from: '妈妈', fly: chat.spot(2), at: tKey + 0.8 });

  // One hour
  P.big(1330, 740, '一小时', {
    at: P.cw(2, '一小时', -0.2),
    color: 'orange',
  });
});
