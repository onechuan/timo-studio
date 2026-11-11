import { expect, it } from 'vitest';
import { createProductionRunner } from '../packages/core/src/production/runner.js';
import type {
  Production,
  Job,
  SceneReview,
} from '../packages/contracts/src/index.js';

function harness(failOnce = false) {
  let saved = {
    projectId: 'p',
    revision: 1,
    jobId: 'job',
    stage: 'illustrating',
    artifacts: { audio: 'old.wav' },
    events: [],
    scenes: [{ id: 's', artwork: { version: 1, elements: [] } }],
  } as unknown as Production;
  const calls: string[] = [];
  const checkpoints: Production[] = [];
  const no = async () => {
    throw Error('unexpected');
  };
  const operations: any = {
    plan: no,
    script: no,
    narrate: no,
    render: no,
    illustrateScene: no,
    compose: async (p: Production) => {
      calls.push('compose');
      return p;
    },
    reviewScene: async (p: Production) => {
      calls.push('review');
      if (failOnce) {
        failOnce = false;
        throw Error('review failed');
      }
      const round = p.scenes[0].review?.round ?? 0;
      const review: SceneReview = {
        fingerprint: 'hash',
        status: round >= 2 ? 'passed' : 'needs_attention',
        round,
        mode: 'visual',
        frames: [],
        omittedCueIds: [],
        issues:
          round >= 2
            ? []
            : [
                {
                  kind: 'visual',
                  severity: 'warning',
                  atMs: 0,
                  elementIds: [],
                  what: '遮挡',
                  fix: '移动',
                },
              ],
      };
      return { ...p, scenes: [{ ...p.scenes[0], review }] };
    },
    repairScene: async (p: Production) => {
      calls.push('repair');
      return {
        ...p,
        scenes: [
          {
            ...p.scenes[0],
            review: { ...p.scenes[0].review!, status: 'checking' },
          },
        ],
      };
    },
  };
  const run = createProductionRunner(
    {
      load: async () => ({
        job: { id: 'job', type: 'illustrate', status: 'queued' } as Job,
        production: saved,
      }),
      start: async () => {},
      checkpoint: async (p) => {
        saved = p;
        checkpoints.push(structuredClone(p));
      },
      complete: async (p) => {
        saved = p;
      },
      fail: async (p) => {
        saved = p;
      },
    },
    () => operations,
    () => 'safe',
  );
  return {
    run: () => run('job'),
    get saved() {
      return saved;
    },
    calls,
    checkpoints,
    operations,
  };
}
it('checks existing artwork, repairs at most twice, and checkpoints before each repair', async () => {
  const h = harness();
  await h.run();
  expect(h.calls).toEqual([
    'review',
    'repair',
    'review',
    'repair',
    'review',
    'compose',
  ]);
  expect(
    h.checkpoints
      .filter((p) => p.scenes[0].review?.status === 'repairing')
      .map((p) => p.scenes[0].review?.round),
  ).toEqual([1, 2]);
  expect(h.saved.scenes[0].review?.status).toBe('passed');
  expect(h.saved.artifacts.audio).toBe('old.wav');
});
it('records service failure and resumes review without drawing or narration', async () => {
  const h = harness(true);
  await expect(h.run()).rejects.toThrow('safe');
  expect(h.saved.scenes[0].review?.status).toBe('failed');
  await h.run();
  expect(h.saved.scenes[0].review?.status).toBe('passed');
});
it('leaves unresolved visual issues for explicit acceptance after two repairs', async () => {
  const h = harness();
  const original = h.operations.reviewScene;
  h.operations.reviewScene = async (p: Production) => {
    const next = await original(p);
    next.scenes[0].review.status = 'needs_attention';
    return next;
  };
  await h.run();
  expect(h.calls.filter((c) => c === 'repair')).toHaveLength(2);
  expect(h.saved.scenes[0].review?.status).toBe('needs_attention');
});
it('blocks composition when a layout error remains after two repairs', async () => {
  const h = harness();
  h.operations.reviewScene = async (p: Production) => {
    const round = p.scenes[0].review?.round ?? 0;
    return {
      ...p,
      scenes: [
        {
          ...p.scenes[0],
          review: {
            fingerprint: `layout-${round}`,
            status: 'needs_attention' as const,
            round,
            mode: 'layout' as const,
            frames: [],
            omittedCueIds: [],
            issues: [
              {
                kind: 'layout' as const,
                severity: 'error' as const,
                atMs: 0,
                elementIds: [],
                what: '主体超出画面',
                fix: '缩小并移回安全区',
              },
            ],
          },
        },
      ],
    };
  };

  await expect(h.run()).rejects.toThrow('safe');
  expect(h.calls.filter((call) => call === 'repair')).toHaveLength(2);
  expect(h.calls).not.toContain('compose');
});
it('single-page redraw never reviews or repairs other pages', async () => {
  const h = harness();
  h.saved.reviewTask = { sceneId: 's', mode: 'illustrate' };
  h.saved.scenes.push({ ...h.saved.scenes[0], id: 'untouched' });
  const reviewed: number[] = [];
  h.operations.reviewScene = async (p: Production, index: number) => {
    reviewed.push(index);
    return p;
  };
  await h.run();
  expect(reviewed).toEqual([0]);
  expect(h.saved.scenes[1].review).toBeUndefined();
});
