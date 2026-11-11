import { expect, it } from 'vitest';
import {
  allocateSceneBudgets,
  durationBand,
  estimateNarrationMs,
} from '../packages/agent/src/director/duration.js';
import { productionBriefSchema } from '../packages/contracts/src/production.js';

it('builds a ten-percent acceptance band around five minutes', () => {
  expect(durationBand(300)).toEqual({
    targetMs: 300_000,
    minMs: 270_000,
    maxMs: 330_000,
  });
});

it('allocates deterministic weighted scene budgets near the target', () => {
  const budgets = allocateSceneBudgets([{ weight: 1 }, { weight: 2 }], 300);
  expect(budgets.reduce((sum, value) => sum + value, 0)).toBeGreaterThanOrEqual(
    285,
  );
  expect(budgets.reduce((sum, value) => sum + value, 0)).toBeLessThanOrEqual(
    315,
  );
  expect(budgets[1]).toBeGreaterThan(budgets[0]);
});

it('requires source narration for verbatim mode and strips it in AI mode', () => {
  expect(() =>
    productionBriefSchema.parse({
      topic: '测试',
      narrationMode: 'verbatim',
      sourceNarration: '',
    }),
  ).toThrow('逐字原稿');
  expect(
    productionBriefSchema.parse({
      topic: '测试',
      narrationMode: 'ai',
      sourceNarration: '不应保留',
    }).sourceNarration,
  ).toBeUndefined();
});

it('estimates Chinese narration with punctuation pauses', () => {
  const result = estimateNarrationMs([
    { cues: [{ text: '第一句话。' }, { text: '第二句话，稍作停顿。' }] },
  ]);
  expect(result.estimatedMs).toBeGreaterThan(2_000);
  expect(result.sceneMs).toHaveLength(1);
  expect(result.confidence).toBeGreaterThan(0.5);
});
