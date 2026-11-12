import { describe, it, expect } from 'vitest';
import {
  createProductionRunner,
  productionJobTimeoutMs,
  type ProductionRunStore,
} from '../packages/core/src/production/runner.js';
import { ProductionFailureError } from '../packages/core/src/production/failure.js';
import type { ProductionFailure } from '../packages/contracts/src/production-failure.js';
import type { Production, Job } from '../packages/contracts/src/index.js';
describe('production runner', () => {
  it('gives long exports a timeout budget proportional to film length', () => {
    const minutes = (ms: number) => ms / 60_000;
    expect(minutes(productionJobTimeoutMs('plan', 276_888))).toBe(20);
    expect(minutes(productionJobTimeoutMs('export', 0))).toBe(30);
    expect(minutes(productionJobTimeoutMs('export', 60_000))).toBe(30);
    expect(minutes(productionJobTimeoutMs('export', 276_888))).toBeCloseTo(
      56.17,
      1,
    );
    expect(minutes(productionJobTimeoutMs('export', 3 * 60 * 60 * 1000))).toBe(
      120,
    );
    expect(minutes(productionJobTimeoutMs('edit-export', 276_888))).toBe(20);
    expect(minutes(productionJobTimeoutMs('edit-export', 60 * 60 * 1000))).toBe(
      120,
    );
  });

  it('repairs only pages named by whole-film review and stops after two rounds', async () => {
    const repaired: string[] = [];
    let saved = {
      projectId: 'project',
      revision: 1,
      jobId: 'job',
      stage: 'illustrating',
      brief: { durationSec: 60, style: 'warm' },
      artifacts: { audio: 'voice.wav' },
      events: [],
      scenes: ['p01', 'p02', 'p03', 'p04'].map((id) => ({
        id,
        artwork: { version: 1, intent: id, elements: [] },
      })),
      visual: {
        upstreamRevision: 'a'.repeat(40),
        engineRevision: `sha256:${'b'.repeat(64)}`,
        style: 'warm-story',
        filmKit: { status: 'none', components: [] },
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
        illustrateScene: unchanged,
        render: unchanged,
        compose: unchanged,
        reviewScene: async (production, index) => ({
          ...production,
          scenes: production.scenes.map((scene, sceneIndex) =>
            sceneIndex === index
              ? {
                  ...scene,
                  review: {
                    fingerprint: `page-${scene.id}`,
                    status: 'passed' as const,
                    round: scene.review?.round ?? 0,
                    mode: 'visual' as const,
                    frames: [],
                    issues: [],
                    omittedCueIds: [],
                  },
                }
              : scene,
          ),
        }),
        repairScene: async (production, index) => {
          repaired.push(production.scenes[index]!.id);
          return production;
        },
        reviewWholeFilm: async (production) => {
          const round = production.visual!.wholeFilmReview?.round ?? 0;
          const sceneIds = round === 0 ? ['p02'] : ['p02', 'p04'];
          return {
            ...production,
            visual: {
              ...production.visual!,
              wholeFilmReview: {
                fingerprint: `whole-${round}`.padEnd(64, '0'),
                status: 'needs_attention' as const,
                round,
                frames: [],
                issues: sceneIds.map((sceneId) => ({
                  kind: 'continuity' as const,
                  severity: 'warning' as const,
                  sceneIds: [sceneId],
                  atMs: 0,
                  elementIds: [],
                  what: '主体不连续',
                  fix: '延续主体外观',
                })),
              },
            },
          };
        },
      }),
      () => 'safe',
    )('job');

    expect(repaired).toEqual(['p02', 'p02', 'p04']);
    expect(saved.visual?.wholeFilmReview?.round).toBe(2);
  });

  it('checks a reusable Film Kit before drawing any page', async () => {
    const calls: string[] = [];
    let saved = {
      projectId: 'project',
      revision: 1,
      jobId: 'job',
      stage: 'narrating',
      brief: { durationSec: 60, style: 'warm' },
      artifacts: { audio: 'voice.wav' },
      scenes: [{ id: 'p01' }, { id: 'p02' }],
      events: [],
    } as unknown as Production;
    const unchanged = async (production: Production) => production;
    const withKit = (production: Production, filmKit: object): Production =>
      ({
        ...production,
        visual: {
          upstreamRevision: 'a'.repeat(40),
          engineRevision: `sha256:${'b'.repeat(64)}`,
          style: 'warm-story',
          filmKit,
        },
      }) as Production;
    await createProductionRunner(
      {
        load: async () => ({
          job: { id: 'job', type: 'produce', status: 'queued' } as Job,
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
        planFilmKit: async (production) => {
          calls.push('plan-kit');
          return withKit(production, {
            status: 'planned',
            components: [
              {
                name: 'cup',
                what: 'cup',
                pages: ['p01', 'p02'],
                status: 'planned',
              },
              {
                name: 'machine',
                what: 'machine',
                pages: ['p01', 'p02'],
                status: 'planned',
              },
            ],
          });
        },
        generateFilmKitPart: async (production, name) => {
          calls.push(`part:${name}`);
          const source = `PV.Builder.prototype.${name}=function(){};B.${name}=function(){}`;
          return withKit(production, {
            ...production.visual!.filmKit!,
            status: name === 'machine' ? 'checking' : 'generating',
            source,
            sourceHash: 'c'.repeat(64),
            components: production.visual!.filmKit!.components.map(
              (component) =>
                component.name === name
                  ? {
                      ...component,
                      status: 'checking',
                      source,
                      sourceHash: 'c'.repeat(64),
                    }
                  : component,
            ),
          });
        },
        reviewFilmKit: async (production) => {
          calls.push('review-kit');
          return withKit(production, {
            ...production.visual!.filmKit!,
            status: 'passed',
          });
        },
        illustrateScene: async (production, index) => {
          calls.push(`page:${production.scenes[index].id}`);
          return production;
        },
        compose: async (production) => {
          calls.push('compose');
          return production;
        },
      }),
      () => 'safe',
    )('job');

    expect(calls).toEqual([
      'plan-kit',
      'part:cup',
      'part:machine',
      'review-kit',
      'page:p01',
      'page:p02',
      'compose',
    ]);
    expect(saved.visual?.filmKit?.status).toBe('passed');
  });

  it('persists a typed review failure with its exact resume point', async () => {
    const production = {
      projectId: 'project',
      revision: 1,
      jobId: 'job',
      stage: 'illustrating',
      artifacts: { audio: 'voice.wav' },
      events: [],
      scenes: [
        {
          id: 'p01',
          artwork: { version: 1, intent: 'test', elements: [] },
        },
      ],
    } as unknown as Production;
    let persisted:
      { production: Production; failure: ProductionFailure } | undefined;
    const unchanged = async (p: Production) => p;
    const run = createProductionRunner(
      {
        load: async () => ({
          job: { id: 'job', type: 'illustrate', status: 'queued' } as Job,
          production,
        }),
        start: async () => {},
        checkpoint: async () => {},
        complete: async () => {},
        fail: async (p, _id, _action, failure) => {
          persisted = { production: p, failure };
        },
      },
      () => ({
        plan: unchanged,
        script: unchanged,
        narrate: unchanged,
        illustrateScene: unchanged,
        compose: unchanged,
        render: unchanged,
        reviewScene: async () => {
          throw new ProductionFailureError({
            code: 'REVIEW_BROWSER_RUNTIME_FAILED',
            phase: 'reviewing',
            retryable: true,
            publicMessage: '第 1 页关键帧检查失败，可重试本页',
            context: { sceneId: 'p01' },
          });
        },
      }),
      () => 'generic',
    );

    await expect(run('job')).rejects.toThrow('第 1 页关键帧检查失败');
    expect(persisted?.failure).toMatchObject({
      code: 'REVIEW_BROWSER_RUNTIME_FAILED',
      phase: 'reviewing',
      context: { sceneId: 'p01' },
    });
    expect(persisted?.production.failure).toEqual(persisted?.failure);
    expect(persisted?.production.error).toBe(
      '第 1 页关键帧检查失败，可重试本页',
    );
    expect(persisted?.production.scenes[0].review).toMatchObject({
      status: 'failed',
      resume: 'checking',
    });
  });

  it('labels a drawing failure after a reviewed page as illustrating', async () => {
    const production = {
      projectId: 'project',
      revision: 1,
      jobId: 'job',
      stage: 'illustrating',
      artifacts: { audio: 'voice.wav' },
      events: [],
      scenes: [
        {
          id: 'p01',
          artwork: { version: 1, intent: 'test', elements: [] },
        },
        { id: 'p02' },
      ],
    } as unknown as Production;
    let persisted:
      { production: Production; failure: ProductionFailure } | undefined;
    const unchanged = async (p: Production) => p;
    const run = createProductionRunner(
      {
        load: async () => ({
          job: { id: 'job', type: 'illustrate', status: 'queued' } as Job,
          production,
        }),
        start: async () => {},
        checkpoint: async () => {},
        complete: async () => {},
        fail: async (p, _id, _action, failure) => {
          persisted = { production: p, failure };
        },
      },
      () => ({
        plan: unchanged,
        script: unchanged,
        narrate: unchanged,
        illustrateScene: async (p, index) => {
          if (p.scenes[index].id === 'p02') throw new Error('MODEL_TIMEOUT');
          return p;
        },
        reviewScene: unchanged,
        compose: unchanged,
        render: unchanged,
      }),
      () => '导演模型请求超时，请稍后重试，或缩短目标时长后重新规划',
    );

    await expect(run('job')).rejects.toThrow('导演模型请求超时');
    expect(persisted?.failure).toMatchObject({
      phase: 'illustrating',
      context: { sceneId: 'p02' },
      publicMessage: '导演模型请求超时，请稍后重试，或缩短目标时长后重新规划',
    });
  });

  for (const type of [
    'plan',
    'produce',
    'illustrate',
    'export',
    'edit-export',
  ] as const)
    it(`sequences ${type} and releases`, async () => {
      const calls: string[] = [];
      const production = {
        jobId: 'job',
        scenes: [{}],
        artifacts: {},
        events: [],
        stage: 'ready',
      } as unknown as Production;
      const store = {
        load: async () => ({
          job: { id: 'job', type, status: 'queued' } as Job,
          production,
        }),
        start: async () => {},
        checkpoint: async () => {},
        complete: async () => {
          calls.push('complete');
        },
        fail: async () => {
          calls.push('fail');
        },
      } satisfies ProductionRunStore;
      const op = (name: string) => async (p: Production) => {
        calls.push(name);
        return p;
      };
      await createProductionRunner(
        store,
        () => ({
          plan: op('plan'),
          script: op('script'),
          narrate: op('narrate'),
          illustrateScene: async (p) => op('illustrate')(p),
          compose: op('compose'),
          render: op('render'),
          editExport: op('editExport'),
        }),
        () => 'safe',
      )('job');
      expect(calls).toEqual(
        type === 'plan'
          ? ['plan', 'complete']
          : type === 'produce'
            ? ['narrate', 'illustrate', 'compose', 'complete']
            : type === 'illustrate'
              ? ['illustrate', 'compose', 'complete']
              : type === 'export'
                ? ['render', 'complete']
                : ['editExport', 'complete'],
      );
    });
  for (const condition of ['terminal', 'obsolete', 'checkpoint'] as const)
    it(`stops external operations for ${condition}`, async () => {
      let effects = 0;
      const production = {
        jobId: condition === 'obsolete' ? 'other' : 'job',
        events: [],
        scenes: [],
      } as unknown as Production;
      const store: ProductionRunStore = {
        load: async () => ({
          job: {
            type: 'plan',
            status: condition === 'terminal' ? 'succeeded' : 'queued',
          } as Job,
          production,
        }),
        start: async () => {},
        checkpoint: async () => {
          throw new Error('stale');
        },
        complete: async () => {},
        fail: async () => {},
      };
      const op = async (p: Production) => {
        effects++;
        return p;
      };
      const run = createProductionRunner(
        store,
        () => ({
          plan: op,
          script: op,
          narrate: op,
          illustrateScene: op,
          compose: op,
          render: op,
        }),
        () => 'safe',
      );
      if (condition === 'checkpoint')
        await expect(run('job')).rejects.toThrow('safe');
      else await run('job');
      expect(effects).toBe(0);
    });
  for (const failure of ['load', 'fail'] as const)
    it(`sanitizes ${failure} rejection`, async () => {
      const production = {
        jobId: 'job',
        events: [],
        scenes: [],
      } as unknown as Production;
      const store: ProductionRunStore = {
        load: async () => {
          if (failure === 'load') throw new Error('private database detail');
          return { job: { type: 'plan', status: 'queued' } as Job, production };
        },
        start: async () => {},
        checkpoint: async () => {},
        complete: async () => {},
        fail: async () => {
          throw new Error('private failure detail');
        },
      };
      await expect(
        createProductionRunner(
          store,
          () => {
            throw new Error('provider secret');
          },
          () => 'safe',
        )('job'),
      ).rejects.toThrow('safe');
    });
  it('releases factory failures with sanitized message', async () => {
    let saved: ProductionFailure | undefined;
    const production = { jobId: 'job' } as Production;
    const store = {
      load: async () => ({
        job: { type: 'plan', status: 'queued' } as Job,
        production,
      }),
      start: async () => {},
      checkpoint: async () => {},
      complete: async () => {},
      fail: async (
        _p: Production,
        _id: string,
        _action: string,
        failure: ProductionFailure,
      ) => {
        saved = failure;
      },
    };
    await expect(
      createProductionRunner(
        store,
        () => {
          throw new Error('secret');
        },
        () => 'safe',
      )('job'),
    ).rejects.toThrow('safe');
    expect(saved).toMatchObject({
      code: 'PRODUCTION_UNKNOWN_FAILED',
      publicMessage: 'safe',
      phase: 'planning',
    });
  });
});

it('checkpoints each page and resumes failed drawing without voice or completed page work', async () => {
  let saved = {
    jobId: 'job',
    stage: 'illustrating',
    artifacts: { audio: 'old.wav', subtitles: 'old.srt' },
    scenes: [{ id: 'one' }, { id: 'two' }],
    events: [],
  } as unknown as Production;
  let failSecond = true;
  const drawn: number[] = [],
    checkpoints: number[] = [];
  const no = async () => {
    throw new Error('unexpected external operation');
  };
  const run = createProductionRunner(
    {
      load: async () => ({
        job: { type: 'illustrate', status: 'queued' } as Job,
        production: saved,
      }),
      start: async () => {},
      checkpoint: async (p) => {
        saved = p;
        checkpoints.push(p.scenes.filter((s) => s.artwork).length);
      },
      complete: async (p) => {
        saved = p;
      },
      fail: async (p) => {
        saved = p;
      },
    },
    () => ({
      plan: no,
      script: no,
      narrate: no,
      render: no,
      compose: async (p) => p,
      illustrateScene: async (p, i) => {
        drawn.push(i);
        if (i === 1 && failSecond) throw new Error('provider secret');
        return {
          ...p,
          scenes: p.scenes.map((s, j) =>
            i === j
              ? { ...s, artwork: { version: 1, intent: '主体', elements: [] } }
              : s,
          ),
        };
      },
    }),
    () => 'safe',
  );
  await expect(run('job')).rejects.toThrow('safe');
  expect(checkpoints).toContain(1);
  expect(saved.scenes[0].artwork).toBeDefined();
  failSecond = false;
  await run('job');
  expect(drawn).toEqual([0, 1, 1]);
  expect(saved.artifacts).toEqual({ audio: 'old.wav', subtitles: 'old.srt' });
  expect(saved.stage).toBe('ready');
});

it('corrects measured long-form narration and accepts the real duration', async () => {
  let saved = {
    projectId: 'duration',
    revision: 1,
    jobId: 'job',
    stage: 'narrating',
    brief: { durationSec: 300, narrationMode: 'ai' },
    scenes: [{ id: 'p01', cues: [{ id: 'c01', text: '短稿' }] }],
    artifacts: {},
    events: [],
  } as unknown as Production;
  let narrationRound = 0;
  let revisionCalls = 0;
  const unchanged = async (production: Production) => production;
  await createProductionRunner(
    {
      load: async () => ({
        job: { type: 'produce', status: 'queued' } as Job,
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
      illustrateScene: unchanged,
      compose: unchanged,
      render: unchanged,
      narrate: async (production) => ({
        ...production,
        durationMs: ++narrationRound === 1 ? 95_000 : 285_000,
        artifacts: { ...production.artifacts, audio: 'audio.wav' },
      }),
      reviseDuration: async (production) => {
        revisionCalls++;
        return { ...production, artifacts: {} };
      },
    }),
    () => 'safe',
  )('job');

  expect(revisionCalls).toBe(1);
  expect(narrationRound).toBe(2);
  expect(saved.durationState).toMatchObject({
    status: 'accepted',
    measuredMs: 285_000,
    correctionRound: 1,
  });
});

it('never starts a third measured-duration correction round', async () => {
  const production = {
    projectId: 'duration',
    revision: 1,
    jobId: 'job',
    stage: 'narrating',
    brief: { durationSec: 300, narrationMode: 'ai' },
    scenes: [{ id: 'p01', cues: [{ id: 'c01', text: '短稿' }] }],
    artifacts: {},
    events: [],
  } as unknown as Production;
  let revisions = 0;
  let narrations = 0;
  let failed: Production | undefined;
  const unchanged = async (value: Production) => value;
  const run = createProductionRunner(
    {
      load: async () => ({
        job: { type: 'produce', status: 'queued' } as Job,
        production,
      }),
      start: async () => {},
      checkpoint: async () => {},
      complete: async () => {},
      fail: async (value) => {
        failed = value;
      },
    },
    () => ({
      plan: unchanged,
      script: unchanged,
      illustrateScene: unchanged,
      compose: unchanged,
      render: unchanged,
      narrate: async (value) => {
        narrations++;
        return {
          ...value,
          durationMs: [217000, 181000, 175000][narrations - 1],
          artifacts: { ...value.artifacts, audio: `audio-${narrations}.wav` },
        };
      },
      reviseDuration: async (value) => {
        revisions++;
        return { ...value, artifacts: {} };
      },
    }),
    () => 'safe',
  );

  await expect(run('job')).rejects.toThrow('自动校正 2 轮');
  expect(revisions).toBe(2);
  expect(narrations).toBe(3);
  expect(failed?.durationState?.status).toBe('needs-input');
  expect(failed?.durationMs).toBe(217000);
  expect(failed?.artifacts.audio).toBe('audio-1.wav');
});

it.each(['accepted', 'unchanged'] as const)(
  'does not synthesize measured %s narration again',
  async (mode) => {
    const production = {
      projectId: 'duration',
      revision: 1,
      jobId: 'job',
      stage: 'narrating',
      brief: { durationSec: 300, narrationMode: 'ai' },
      durationMs: 175000,
      durationState: {
        targetMs: 175000,
        minMs: 157500,
        maxMs: 192500,
        measuredMs: 175000,
        correctionRound: 0,
        status: 'accepted',
        policy: mode === 'accepted' ? 'accepted-source' : 'target',
      },
      scenes: [
        {
          id: 'p01',
          cues: [{ id: 'c01', text: '咖啡', startMs: 0, endMs: 175000 }],
        },
      ],
      artifacts: { audio: 'saved.wav' },
      events: [],
    } as unknown as Production;
    let narrations = 0,
      revisions = 0,
      composed = false;
    const unchanged = async (p: Production) => p;
    const run = createProductionRunner(
      {
        load: async () => ({
          job: { type: 'produce', status: 'queued' } as Job,
          production,
        }),
        start: async () => {},
        checkpoint: async () => {},
        complete: async () => {},
        fail: async () => {},
      },
      () => ({
        plan: unchanged,
        script: unchanged,
        illustrateScene: unchanged,
        render: unchanged,
        compose: async (p) => {
          composed = true;
          return p;
        },
        narrate: async (p) => {
          narrations++;
          return p;
        },
        reviseDuration: async (p) => {
          revisions++;
          return p;
        },
      }),
      () => 'safe',
    );
    if (mode === 'accepted') await run('job');
    else await expect(run('job')).rejects.toThrow('自动校正 2 轮');
    expect(narrations).toBe(0);
    expect(revisions).toBe(mode === 'accepted' ? 0 : 2);
    expect(composed).toBe(mode === 'accepted');
  },
);
