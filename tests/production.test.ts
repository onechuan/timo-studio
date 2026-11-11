import { expect, it } from 'vitest';
import {
  productionBriefSchema,
  storyboardPlanSchema,
  scriptScenesSchema,
} from '../packages/contracts/src/production.js';
it('创作方向仅接受内置类型，并兼容旧项目', () => {
  for (const contentType of ['general', 'explainer', 'product']) {
    expect(
      productionBriefSchema.parse({ topic: '测试', contentType }),
    ).toMatchObject({ contentType });
  }
  expect(productionBriefSchema.safeParse({ topic: '旧项目' }).success).toBe(
    true,
  );
  expect(
    productionBriefSchema.safeParse({
      topic: '测试',
      contentType: '../../secret',
    }).success,
  ).toBe(false);
});
it('主题或资料即可开始，不要求讲稿', () => {
  expect(productionBriefSchema.safeParse({ topic: '讲讲复利' }).success).toBe(
    true,
  );
  expect(
    productionBriefSchema.safeParse({ materials: '利息也会产生利息。' })
      .success,
  ).toBe(true);
  expect(productionBriefSchema.safeParse({ topic: ' ' }).success).toBe(false);
});
it('分镜必须包含可画的拍点，拒绝重复场景', () => {
  const s = {
    id: 'p01',
    title: '复利',
    say: '收益再次投入',
    visual: '种子长成树',
    beats: ['种子发芽', '长出新枝'],
  };
  expect(
    storyboardPlanSchema.safeParse({
      title: '复利',
      summary: '复利的机制',
      scenes: [s],
    }).success,
  ).toBe(true);
  expect(
    storyboardPlanSchema.safeParse({
      title: '复利',
      summary: '复利的机制',
      scenes: [s, s],
    }).success,
  ).toBe(false);
});
it('口播 cue 不能为空且 ID 不能重复', () => {
  const s = {
    id: 'p01',
    title: '复利',
    visual: '树',
    beats: ['发芽'],
    cues: [{ id: 'p01-c0', text: '利息也会产生利息。' }],
  };
  expect(scriptScenesSchema.safeParse([s]).success).toBe(true);
  expect(
    scriptScenesSchema.safeParse([{ ...s, cues: [{ id: 'x', text: '' }] }])
      .success,
  ).toBe(false);
  expect(
    scriptScenesSchema.safeParse([{ ...s, cues: [s.cues[0], s.cues[0]] }])
      .success,
  ).toBe(false);
});
