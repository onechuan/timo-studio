ENGINE.visual('p02', (P) => {
  P.ground({ tint: 'peach' });
  P.title('每人只多转一个群', { accent: 'orange' });

  // Left phone: the family group, elders deciding to "believe it just in case"
  const chat = P.chat(520, 530, {
    title: '相亲相爱一家人',
    sub: '12人',
    at: 0,
    messages: [
      { from: '二舅', kind: 'link', title: '紧急通知：明天全城停水', text: '速转家人，提前存水！', domain: '内部消息', at: 0.5, typing: 0 },
      { from: '大姨', text: '真的假的？家里可不能断水', at: P.c(0, 1.1) },
      { from: '妈妈', text: '宁可信其有！', at: P.cw(1, '宁可信其有'), hl: true, zoom: true },
      { from: '妈妈', text: '我顺手转到广场舞群了', at: P.c(1, 1.9) },
      { from: '三姑', text: '已转同学群👍', at: P.c(2, 0.2) },
      { from: '二舅', text: '我也转了业主群', at: P.c(2, 1.6) },
      { from: '大姨', text: '好几个群都在说，应该是真的', at: P.c(3, 0.3) },
    ],
  });

  // Tap on the forwarded link: "open it and forward"
  P.tap(0, 0, { to: chat.spot(0), at: P.c(1, 1.4) });

  // Right phone: someone else's chat list, group after group lights up with the same message
  const msg = '[链接] 紧急通知：明天全城停水';
  P.inbox(1400, 530, {
    at: 0,
    chats: [
      { name: '公司同事', text: '下午会议改到三点', time: '09:12', at: 0 },
      { name: '快递驿站', text: '您的包裹已到站', time: '08:40', at: 0 },
      { name: '健身打卡', text: '今天练腿！', time: '昨天', at: 0 },
      { name: '广场舞姐妹群', text: msg, time: '刚刚', unread: [1, 9], at: P.c(1, 2.0) },
      { name: '初中同学群', text: msg, time: '刚刚', unread: [1, 14], at: P.c(2, 0.4) },
      { name: '幸福里业主群', text: msg, time: '刚刚', unread: [1, 37], at: P.c(2, 1.4) },
      { name: '老乡会', text: msg, time: '刚刚', unread: [1, 21], at: P.c(2, 2.3) },
      { name: '单位后勤群', text: msg, time: '刚刚', unread: [1, 56], at: P.c(3, 0.4) },
      { name: '宝妈互助群', text: msg, time: '刚刚', unread: [1, 99], at: P.c(3, 1.4) },
    ],
  });

  // Between the phones: the relay note, then the verdict
  P.note(960, 330, '每人**顺手一转**\n消息就接力跑出去', {
    kicker: '接力', color: 'orange', to: chat.spot(3), at: P.c(2, 0.6),
  });
  P.tag(960, 720, '越转越像真', { icon: 'chat', color: 'orange', at: P.c(3, 0.9) });
});
