import { expect, it } from 'vitest';
import * as contracts from '../packages/contracts/src/index.js';
it('requires a timestamped, actionable visual verdict and rejects contradictory passes', () => {
  const schema = (contracts as any).visualVerdictSchema;
  expect(schema).toBeDefined();
  expect(schema.safeParse({ pass: false, issues: [] }).success).toBe(false);
  expect(
    schema.safeParse({
      pass: true,
      issues: [
        {
          atMs: 20,
          elementIds: ['title'],
          what: '文字被盖住',
          fix: '将标题移到左上方',
        },
      ],
    }).success,
  ).toBe(false);
  expect(
    schema.parse({
      pass: false,
      issues: [
        {
          atMs: 20,
          elementIds: ['title'],
          what: '文字被盖住',
          fix: '将标题移到左上方',
        },
      ],
    }).issues,
  ).toHaveLength(1);
});

it('accepts partial Film Kit state with a bounded whole-film review', () => {
  const schema = (contracts as any).filmVisualStateSchema;
  expect(schema).toBeDefined();
  const visual = schema.parse({
    upstreamRevision: '6145f7e3482628543bd6f2d68fe3b618d366213a',
    engineRevision: `sha256:${'a'.repeat(64)}`,
    style: 'chalkboard',
    filmKit: {
      status: 'partial',
      source: '(function(B){})();',
      sourceHash: 'b'.repeat(64),
      components: [
        {
          name: 'coffeeCup',
          what: '同一只白色陶瓷咖啡杯',
          pages: ['p01', 'p03'],
          status: 'passed',
        },
      ],
    },
    wholeFilmReview: {
      fingerprint: 'c'.repeat(64),
      status: 'checking',
      round: 0,
      issues: [],
      frames: [],
    },
  });
  expect(visual.filmKit.components[0].name).toBe('coffeeCup');
  expect(
    schema.safeParse({
      ...visual,
      wholeFilmReview: { ...visual.wholeFilmReview, round: 3 },
    }).success,
  ).toBe(false);
});
