import { expect, it } from 'vitest';
import type { Production } from '../packages/contracts/src/index.js';
import { reviewWholeFilm } from '../packages/agent/src/whole-film-review.js';
import type { WholeFilmEvidence } from '../packages/renderer/src/whole-film-review.js';
import { wholeFilmReviewer } from '../apps/worker/src/handlers/whole-film.js';

const film = {
  projectId: 'whole-film',
  revision: 0,
  aspectRatio: '16:9',
  brief: { topic: '连续性', style: 'warm', language: 'zh' },
  scenes: [
    {
      id: 'p01',
      title: '开始',
      visual: '同一个主体出现',
      beats: ['开始'],
      cues: [{ id: 'c01', text: '开始。', startMs: 0, endMs: 1000 }],
    },
    {
      id: 'p02',
      title: '结束',
      visual: '主体完成变化',
      beats: ['结束'],
      cues: [{ id: 'c02', text: '结束。', startMs: 1000, endMs: 2000 }],
    },
  ],
  durationMs: 2000,
  artifacts: {},
  events: [],
} as unknown as Production;

const evidence: WholeFilmEvidence = {
  fingerprint: 'a'.repeat(64),
  sheetKey: 'production/whole-film/r0/review/whole-film/whole-film-r0.jpg',
  sheet: { mimeType: 'image/jpeg', data: 'YWJj' },
  pages: [
    { sceneId: 'p01', timeMs: 999, key: 'p01.png' },
    { sceneId: 'p02', timeMs: 1999, key: 'p02.png' },
  ],
  transitions: [{ from: 'p01', to: 'p02', timeMs: 1000, key: 't.png' }],
};

it('accepts a bounded whole-film verdict against real page ranges', async () => {
  const result = await reviewWholeFilm(film, evidence, {
    generate: async (_system, user, images) => {
      expect(user).toContain('p01');
      expect(images).toEqual([{ mimeType: 'image/jpeg', data: 'YWJj' }]);
      return {
        value: {
          pass: false,
          issues: [
            {
              sceneId: 'p02',
              atMs: 1500,
              kind: 'continuity',
              severity: 'warning',
              what: '主体颜色发生跳变',
              fix: '沿用上一页主体颜色',
            },
          ],
        },
        usage: { input: 2, output: 3 },
      };
    },
  });
  expect(result.issues[0]).toMatchObject({ sceneIds: ['p02'], atMs: 1500 });
});

it('rejects issues outside real pages or time ranges', async () => {
  await expect(
    reviewWholeFilm(film, evidence, {
      generate: async () => ({
        value: {
          pass: false,
          issues: [
            {
              sceneId: 'missing',
              atMs: 9000,
              kind: 'continuity',
              severity: 'error',
              what: '不存在的页面',
              fix: '无效',
            },
          ],
        },
        usage: { input: 0, output: 0 },
      }),
    }),
  ).rejects.toThrow('WHOLE_FILM_REVIEW_INVALID');
});

it('checkpoints contact-sheet evidence before the vision verdict', async () => {
  const production = {
    ...film,
    visual: {
      upstreamRevision: 'a'.repeat(40),
      engineRevision: `sha256:${'b'.repeat(64)}`,
      style: 'warm-story',
    },
  } as Production;
  const checkpoints: Production[] = [];
  const reviewed = await wholeFilmReviewer(
    '/tmp',
    {},
    {
      generate: async () => ({
        value: { pass: true, issues: [] },
        usage: { input: 4, output: 1 },
      }),
    },
    async () => evidence,
  )(
    production,
    AbortSignal.timeout(1000),
    async (next) => void checkpoints.push(structuredClone(next)),
  );

  expect(checkpoints[0]?.visual?.wholeFilmReview).toMatchObject({
    status: 'checking',
    frames: expect.arrayContaining([
      expect.objectContaining({ key: evidence.sheetKey }),
    ]),
  });
  expect(reviewed.visual?.wholeFilmReview?.status).toBe('passed');
  expect(reviewed.usage).toEqual({ input: 4, output: 1 });
});
