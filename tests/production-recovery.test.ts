import { expect, it, vi } from 'vitest';
import {
  reconcileProductionQueue,
  failProductionJob,
} from '../packages/db/src/production.js';
import { createProductionRunner } from '../packages/core/src/production/runner.js';
import type { Job, Production } from '../packages/contracts/src/index.js';
import {
  wholeFilmReviewer,
  wholeFilmStateFingerprint,
} from '../apps/worker/src/handlers/whole-film.js';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { wholeFilmFingerprint } from '../packages/renderer/src/whole-film-review.js';
import { reviewModelConfig } from '../packages/agent/src/runtime/vision.js';

it('resumes Film Kit generation without repeating a checkpointed component', async () => {
  const calls: string[] = [];
  let saved = {
    projectId: 'project',
    revision: 1,
    jobId: 'job',
    stage: 'illustrating',
    brief: { durationSec: 60, style: 'warm' },
    artifacts: { audio: 'voice.wav' },
    events: [],
    scenes: [
      { id: 'p01', artwork: {} },
      { id: 'p02', artwork: {} },
    ],
    visual: {
      upstreamRevision: 'a'.repeat(40),
      engineRevision: `sha256:${'b'.repeat(64)}`,
      style: 'warm-story',
      filmKit: {
        status: 'generating',
        source: 'B.cup=function(){}',
        sourceHash: 'c'.repeat(64),
        components: [
          {
            name: 'cup',
            what: 'cup',
            pages: ['p01', 'p02'],
            status: 'checking',
            source: 'B.cup=function(){}',
            sourceHash: 'c'.repeat(64),
          },
          {
            name: 'machine',
            what: 'machine',
            pages: ['p01', 'p02'],
            status: 'planned',
          },
        ],
      },
    },
  } as unknown as Production;
  const unchanged = async (production: Production) => production;
  await createProductionRunner(
    {
      load: async () => ({
        job: { id: 'job', type: 'illustrate', status: 'queued' } as Job,
        production: saved,
      }),
      start: async () => {},
      checkpoint: async (production) => {
        saved = production;
      },
      complete: async (production) => {
        saved = production;
      },
      fail: async () => {},
    },
    () => ({
      plan: unchanged,
      script: unchanged,
      narrate: unchanged,
      render: unchanged,
      compose: unchanged,
      planFilmKit: async () => {
        throw new Error('must not re-plan');
      },
      generateFilmKitPart: async (production, name) => {
        calls.push(name);
        const source = `${production.visual!.filmKit!.source}\nB.machine=function(){}`;
        return {
          ...production,
          visual: {
            ...production.visual!,
            filmKit: {
              ...production.visual!.filmKit!,
              status: 'checking',
              source,
              sourceHash: 'd'.repeat(64),
              components: production.visual!.filmKit!.components.map(
                (component) =>
                  component.name === name
                    ? {
                        ...component,
                        status: 'checking' as const,
                        source: 'B.machine=function(){}',
                        sourceHash: 'd'.repeat(64),
                      }
                    : component,
              ),
            },
          },
        };
      },
      reviewFilmKit: async (production) => ({
        ...production,
        visual: {
          ...production.visual!,
          filmKit: { ...production.visual!.filmKit!, status: 'passed' },
        },
      }),
      illustrateScene: unchanged,
    }),
    () => 'safe',
  )('job');

  expect(calls).toEqual(['machine']);
  expect(saved.visual?.filmKit?.status).toBe('passed');
});

it('resumes from persisted whole-film evidence without recapturing it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timotv-whole-resume-'));
  const sheetKey = 'production/project/r1/review/whole-film/whole-film-r1.jpg';
  await mkdir(join(root, 'production/project/r1/review/whole-film'), {
    recursive: true,
  });
  await writeFile(join(root, sheetKey), Buffer.from('jpeg-evidence'));
  let captureCalls = 0;
  const capture = async () => {
    captureCalls++;
    return {
      fingerprint: 'a'.repeat(64),
      sheetKey,
      sheet: { mimeType: 'image/jpeg' as const, data: 'anBlZy1ldmlkZW5jZQ==' },
      pages: [
        {
          sceneId: 'p01',
          timeMs: 999,
          key: 'production/project/r1/review/whole-film/p01.png',
        },
      ],
      transitions: [],
    };
  };
  let saved = {
    projectId: 'project',
    revision: 1,
    aspectRatio: '16:9',
    brief: { topic: 'resume', style: 'warm' },
    scenes: [
      {
        id: 'p01',
        cues: [{ id: 'c01', text: 'one', startMs: 0, endMs: 1000 }],
        artwork: { version: 1, intent: 'one', elements: [] },
      },
    ],
    visual: {
      upstreamRevision: 'a'.repeat(40),
      engineRevision: `sha256:${'b'.repeat(64)}`,
      style: 'warm-story',
      filmKit: { status: 'none', components: [] },
    },
    artifacts: {},
    events: [],
  } as unknown as Production;
  const contentFingerprint = wholeFilmFingerprint(saved);
  const failing = wholeFilmReviewer(
    root,
    {},
    { generate: async () => Promise.reject(new Error('MODEL_TIMEOUT')) },
    capture,
  );
  await expect(
    failing(saved, AbortSignal.timeout(1000), async (next) => {
      saved = next;
    }),
  ).rejects.toThrow('WHOLE_FILM_MODEL_FAILED');
  expect(wholeFilmFingerprint(saved)).toBe(contentFingerprint);
  expect(saved.visual?.wholeFilmReview?.frames).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ cueId: 'p01' }),
      expect.objectContaining({ key: sheetKey }),
    ]),
  );
  expect(saved.visual?.wholeFilmReview?.fingerprint).toBe(
    wholeFilmStateFingerprint(saved, reviewModelConfig({}).revision),
  );
  saved.visual!.wholeFilmReview!.status = 'failed';

  const resumed = wholeFilmReviewer(
    root,
    {},
    {
      generate: async () => ({
        value: { pass: true, issues: [] },
        usage: { input: 1, output: 1 },
      }),
    },
    capture,
  );
  saved = await resumed(saved, AbortSignal.timeout(1000));
  expect(captureCalls).toBe(1);
  expect(saved.visual?.wholeFilmReview?.status).toBe('passed');
  await rm(root, { recursive: true, force: true });
});
it('requeues only queued production jobs still owning the document', async () => {
  const enqueue = vi.fn();
  const findMany = vi.fn(async () => [
    { id: 'owned', projectId: 'p', status: 'queued' },
    { id: 'obsolete', projectId: 'p' },
  ]);
  const db = {
    job: { findMany, updateMany: vi.fn() },
    production: { findUnique: async () => ({ jobId: 'owned' }) },
  };
  await reconcileProductionQueue(db as never, { enqueue });
  expect(enqueue.mock.calls).toEqual([['owned']]);
  expect(findMany.mock.calls[0]).toEqual([
    {
      where: {
        status: { in: ['queued', 'running'] },
        type: {
          in: ['plan', 'produce', 'illustrate', 'export', 'edit-export'],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    },
  ]);
});
it('terminal failure does not overwrite a newer owner', async () => {
  const updateMany = vi.fn();
  const tx = {
    job: {
      findUnique: async () => ({ projectId: 'p', status: 'running' }),
      updateMany,
    },
    production: { findUnique: async () => ({ jobId: 'new-job' }), updateMany },
  };
  await failProductionJob(
    { $transaction: (fn: (v: unknown) => unknown) => fn(tx) } as never,
    'old-job',
    'stalled',
  );
  expect(updateMany).not.toHaveBeenCalled();
});
it.each([
  ['queued', 'plan'],
  ['running', 'edit-export'],
] as const)(
  'terminal queue entry releases its %s %s durable owner as failed',
  async (status, type) => {
    const productionUpdate = vi.fn(async () => ({ count: 1 }));
    const jobUpdate = vi.fn();
    const job = { id: 'j', projectId: 'p', status, type };
    const row = {
      jobId: 'j',
      revision: 1,
      data: { projectId: 'p', revision: 1, events: [] },
    };
    const tx = {
      job: { findUnique: async () => job, updateMany: jobUpdate },
      production: { findUnique: async () => row, updateMany: productionUpdate },
    };
    const db = {
      job: { findMany: async () => [job] },
      production: { findUnique: async () => row },
      $transaction: (fn: (v: unknown) => unknown) => fn(tx),
    };
    const enqueue = vi.fn();
    await reconcileProductionQueue(db as never, {
      enqueue,
      state: async () => 'completed',
    });
    expect(enqueue).not.toHaveBeenCalled();
    expect(productionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projectId: 'p', revision: 1, jobId: 'j' },
        data: expect.objectContaining({
          jobId: null,
          data: expect.objectContaining({
            stage: 'failed',
            failedAction: type,
          }),
        }),
      }),
    );
    expect(jobUpdate).toHaveBeenCalled();
  },
);
it('cancels obsolete queued rows so they cannot starve subsequent scans', async () => {
  const updateMany = vi.fn();
  const enqueue = vi.fn();
  const db = {
    job: { findMany: async () => [{ id: 'old', projectId: 'p' }], updateMany },
    production: { findUnique: async () => ({ jobId: 'new' }) },
  };
  await reconcileProductionQueue(db as never, { enqueue });
  expect(updateMany).toHaveBeenCalledWith({
    where: { id: 'old', status: 'queued' },
    data: { status: 'cancelled', finishedAt: expect.any(Date) },
  });
  expect(enqueue).not.toHaveBeenCalled();
});
it.each([undefined, 'unknown', 'active', 'waiting', 'delayed'])(
  'running job with queue state %s stays untouched',
  async (state) => {
    const enqueue = vi.fn();
    const updateMany = vi.fn();
    const db = {
      job: {
        findMany: async () => [{ id: 'j', projectId: 'p', status: 'running' }],
        updateMany,
      },
      production: { findUnique: async () => ({ jobId: 'j' }), updateMany },
    };
    await reconcileProductionQueue(db as never, {
      enqueue,
      state: async () => state,
    });
    expect(enqueue).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  },
);
