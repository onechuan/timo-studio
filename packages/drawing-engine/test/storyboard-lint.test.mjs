import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintStoryboard } from '../tools/storyboard-lint.mjs';

let cue = 0;
const beat = (object, action, text = '', camera = '') => ({ at: `c${cue++}`, object, action, text, camera });
const good = () => ({
  style: 'warm-story', cast: 'hands',
  pages: [
    { id: 'p01', say: '每月存一千元，三十年后有多少？', beats: [beat('一个储蓄罐', '硬币一枚枚落进去', '每月 1000', '跟拍'), beat('储蓄罐', '慢慢鼓起来', '', '推近')] },
    { id: 'p02', say: '复利让雪球越滚越大。', beats: [beat('一颗雪球', '从坡顶滚下，越滚越大', '30 年', '横移'), beat('雪球', '撞上山脚的树停住', '×17', '砸入')] },
    { id: 'p03', say: '时间比本金重要。', beats: [beat('一棵树苗', '长高并结出果子', '', '推近'), beat('一只手', '摘下果子放进罐里', '', '跟拍')] },
  ],
});
const source = '每月存 1000 元，坚持三十年，本金翻了十七倍。';
const msgs = (sb, opts = { source }) => lintStoryboard(sb, opts).map((i) => `${i.level} ${i.page ?? ''} ${i.msg}`);
const reds = (sb, opts) => msgs(sb, opts).filter((m) => m.startsWith('red'));

test('a well-formed storyboard passes', () => {
  assert.deepEqual(reds(good()), []);
});

test('each red rule fires on a deliberately bad storyboard', () => {
  const cases = [
    ['object is only a layout word', (sb) => { sb.pages[1].beats[0].object = '三个卡片'; }, /layout word/],
    ['empty object', (sb) => { sb.pages[1].beats[0].object = ''; }, /object is empty/],
    ['catch-all action', (sb) => { sb.pages[1].beats[0].action = '依次出现'; }, /catch-all word/],
    ['on-screen text too long', (sb) => { sb.pages[1].beats[0].text = '复利是世界第八大奇迹啊'; }, /characters/],
    ['text-led first page', (sb) => { sb.pages[0].beats = [beat('大标题', '写出来', '为什么要存钱'), beat('要点列表', '滑入')]; }, /first page is text-led/],
    ['quote card on the last page', (sb) => { sb.pages[2].beats[1] = beat('金句', '浮现', '时间是朋友'); }, /last beat is text|last page is text-led/],
    ['number without a source', (sb) => { sb.pages[1].beats[1].text = '×25'; sb.pages[1].beats[0].text = '40 年'; }, /has no source/],
    ['only one beat', (sb) => { sb.pages[1].beats.pop(); }, /at least 2/],
    ['character with a face', (sb) => { sb.pages[1].beats[0].object = '一个Q版小人'; }, /character with a face/],
    ['missing style', (sb) => { delete sb.style; }, /missing style/],
    ['unknown style', (sb) => { sb.style = 'neon-cyber'; }, /does not exist/],
    ['missing cast', (sb) => { delete sb.cast; }, /missing cast/],
  ];
  for (const [name, mutate, re] of cases) {
    const sb = good(); mutate(sb);
    assert.ok(reds(sb).some((m) => re.test(m)), `${name}: expected ${re}, got ${JSON.stringify(msgs(sb))}`);
  }
});

test('text-dominated share above 30% is red', () => {
  const sb = good();
  sb.pages[1].beats = [beat('关键词', '写出', '复利'), beat('标题', '弹出', '时间')];
  sb.pages[2].beats.unshift(beat('文字', '淡入', '本金'));
  assert.ok(reds(sb).some((m) => /text-led beats are/.test(m)));
});

test('Chinese numerals in the source ground arabic numbers on screen', () => {
  const sb = good();
  sb.pages[1].beats[0].text = '60%';
  assert.ok(reds(sb, { source: source + '大约百分之六十的人' }).every((m) => !/has no source/.test(m)));
  sb.pages[1].beats[0].text = '2025 年';
  assert.ok(reds(sb, { source: source + '二零二五年' }).every((m) => !/has no source/.test(m)));
  sb.pages[1].beats[0].text = '3万';
  assert.ok(reds(sb, { source: source + '三万元' }).every((m) => !/has no source/.test(m)));
});

test('three identical cameras in a row is a yellow', () => {
  const sb = good();
  for (const p of sb.pages) for (const b of p.beats) b.camera = '推近';
  assert.ok(msgs(sb).some((m) => m.startsWith('yellow') && /three beats in a row/.test(m)));
});

test('an English storyboard is held to the same rules, in English words', () => {
  const page = (id, beats) => ({ id, section: 'x', say: 'Save a thousand a month for thirty years.', beats });
  const sb = { style: 'warm-story', cast: 'none', lang: 'en', pages: [
    page('p01', [{ at: 'c0', object: 'a snowball', action: 'rolls down the hill and grows', text: '30 years' }, { at: 'c1', object: 'a jar of coins', action: 'fills to the brim', text: '' }]),
    page('p02', [{ at: 'c0', object: 'a tree', action: 'grows a crown of apples', text: '' }, { at: 'c1', object: 'a calendar', action: 'flips to the last page', text: '30 years' }]),
  ] };
  assert.deepEqual(reds(sb), []);
  sb.pages[0].beats[0] = { at: 'c0', object: 'a big title card', action: 'appears', text: 'Compound interest is the eighth wonder of the world' };
  const r = reds(sb);
  assert.ok(r.some((m) => /layout word/.test(m)) && r.some((m) => /catch-all word/.test(m)) && r.some((m) => /9 words/.test(m)), r.join('\n'));
});

test('two beats at one cue are flagged for the later one to name its word', () => {
  const sb = good();
  sb.pages[2].beats[1].at = sb.pages[2].beats[0].at;
  const found = lintStoryboard(sb, { source }).filter((i) => /two beats at/.test(i.msg));
  assert.equal(found.length, 1);
  assert.equal(found[0].level, 'yellow');
  assert.equal(found[0].page, 'p03');
  assert.equal(found[0].beat, 1);
  sb.pages[2].beats[1].at = `${sb.pages[2].beats[0].at}:果子`;
  assert.ok(!lintStoryboard(sb, { source }).some((i) => /two beats at/.test(i.msg)));
});
