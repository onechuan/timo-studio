ENGINE.visual('p04', (P) => {
  P.ground({ tint: 'peach' });
  P.title('热搜让恐慌变成行动', { accent: 'orange' });

  const kw = (() => { try { return P.cw(1, '去哪买水'); } catch (e) { return P.c(1, 1.4); } })();
  const k10 = (() => { try { return P.cw(3, '10万人'); } catch (e) { return P.c(3, 1.6); } })();

  // phone: trending list → the rumour climbs to #1 → typed query → suggestion
  P.search(560, 540, {
    at: 0,
    hot: ['新学期开学安排', '周末天气转凉', '地铁新线试运行', '演唱会门票开售', '本地美食节', '全城停水 热', '高速节假日免费'],
    rise: { from: 5, at: P.c(0, 0.5) },
    query: '停水',
    typeAt: P.c(1, 0.1),
    cps: 4,
    suggest: ['停水去哪买水', '停水 什么时候恢复', '停水 官方通知', '停水 怎么储水', '停水 最新消息'],
    pick: 0,
    pickAt: kw,
  });

  // camera: push into the search box while the suggestion appears
  P.cam([
    P.push(P.c(1, 0.2), 600, 420, 1.25),
    P.back(P.c(2, -0.1)),
  ]);

  const hideAt = (h, t) => { if (h && h.hide) h.hide(t, 0.4); };

  // right side, beat 1: #1 on the trending list
  const L1 = P.layer();
  L1.big(1340, 440, '热搜第1', { at: P.c(0, 0.5), color: 'orange', sub: '“全城停水”一路冲上榜首' });

  // beat 2: the suggestion lifted big
  const L2 = P.layer();
  L2.say(1340, 450, '去哪买水', { from: 'me', at: kw + 0.2 });

  const fade = (lt, t) => Math.max(0, Math.min(1, 1 - (lt - t) / 0.4));
  P.tick((lt) => {
    L1.wrap.style.opacity = fade(lt, kw - 0.3);
    L2.wrap.style.opacity = fade(lt, P.c(2, 0));
  });

  // beat 3: shelves emptied
  P.toast(1340, 350, {
    app: 'social', title: '同城生活', text: '超市货架上的水，**全被搬空了**！',
    at: P.c(2, 0.3),
  });

  // beat 4: 10万人 counting in, landing on the spoken number
  P.big(1340, 660, null, {
    count: [0, 10], unit: '万人', dur: 1.3, at: k10 - 1.3,
    color: 'orange', sub: '官方回应时，已经在囤水',
  });
});
