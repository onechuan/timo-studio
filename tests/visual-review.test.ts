import { expect, it } from 'vitest';
import { reviewFilmScene } from '../packages/agent/src/review.js';
import type { Production } from '../packages/contracts/src/index.js';
const p = {
  scenes: [
    {
      id: 's',
      title: '水位',
      visual: '水位升高',
      beats: ['水位升高'],
      cues: [{ id: 'c', text: '倒入水', startMs: 0, endMs: 1000 }],
      artwork: { elements: [{ id: 'cup' }] },
    },
  ],
  brief: { style: 'warm' },
  aspectRatio: '16:9',
} as unknown as Production;
it('sends real images and timing to an independent review call', async () => {
  const result = await reviewFilmScene(
    p,
    0,
    [{ key: 'frame.png', timeMs: 500, data: 'YWJj' }],
    [],
    {
      generate: async (system, user, images) => {
        expect(system).toContain('独立');
        expect(user).toContain('倒入水');
        expect(images).toEqual([{ mimeType: 'image/png', data: 'YWJj' }]);
        return {
          value: {
            pass: false,
            issues: [
              {
                atMs: 500,
                elementIds: ['cup'],
                what: '杯被裁切',
                fix: '向左移动',
              },
            ],
          },
          usage: { input: 1, output: 2 },
        };
      },
    },
  );
  expect(result.issues[0]).toMatchObject({ kind: 'visual', atMs: 500 });
});
it('rejects verdicts about another page or nonexistent elements', async () => {
  await expect(
    reviewFilmScene(
      p,
      0,
      [{ key: 'frame.png', timeMs: 500, data: 'YWJj' }],
      [],
      {
        generate: async () => ({
          value: {
            pass: false,
            issues: [
              { atMs: 2000, elementIds: ['other'], what: '问题', fix: '修正' },
            ],
          },
          usage: { input: 0, output: 0 },
        }),
      },
    ),
  ).rejects.toThrow('REVIEW_INVALID');
});
