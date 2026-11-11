import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { loadEnvFile } from 'node:process';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  stat,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import {
  PrismaClient,
  productionStore,
  productionRunStore,
} from '../../packages/db/src/index.js';
import {
  createProductionRunner,
  type ProductionOperations,
} from '../../packages/core/src/production/runner.js';
import { sceneReviewer } from '../../apps/worker/src/handlers/review.js';
import { animationScene } from '../fixtures/animation-v2.js';
import type {
  Production,
  SceneReview,
} from '../../packages/contracts/src/index.js';
const testFailure = (publicMessage: string) => ({
  code: 'TEST_FAILURE',
  phase: 'illustrating' as const,
  retryable: true,
  publicMessage,
  diagnosticId: randomUUID(),
});
import { isLegacyArtwork } from '../../packages/contracts/src/artwork.js';
import type { VisionGenerator } from '../../packages/agent/src/runtime/vision.js';
loadEnvFile();
const digest = (data: Buffer | string) =>
  createHash('sha256').update(data).digest('hex');
describe.skipIf(process.env.RUN_INTEGRATION !== '1')(
  'real Chrome evidence + production runner + PostgreSQL review checkpoints',
  () => {
    const db = new PrismaClient();
    const projects: string[] = [];
    let root: string;
    beforeAll(async () => {
      root = await mkdtemp(join(tmpdir(), 'timo-visual-workflow-'));
    });
    afterAll(async () => {
      await db.project.deleteMany({ where: { id: { in: projects } } });
      await db.$disconnect();
      await rm(root, { recursive: true, force: true });
    });
    async function fixture(two = false) {
      const project = await db.project.create({
        data: {
          title: 'Owned visual review integration',
          kind: 'generated',
          aspectRatio: '16:9',
        },
      });
      projects.push(project.id);
      const scene = animationScene();
      const dir = `production/${project.id}/audio`;
      await mkdir(join(root, dir), { recursive: true });
      const audio = `${dir}/preserved.wav`,
        subtitles = `${dir}/preserved.srt`;
      await writeFile(
        join(root, audio),
        Buffer.from('owned-audio-preservation-fixture'),
      );
      await writeFile(
        join(root, subtitles),
        '1\n00:00:00,000 --> 00:00:02,000\n保留字幕\n',
      );
      const p: Production = {
        projectId: project.id,
        revision: 0,
        aspectRatio: '16:9',
        stage: 'ready',
        brief: {
          topic: 'visual review integration',
          materials: '',
          durationSec: 15,
          language: 'zh',
          style: 'warm',
          voiceProvider: 'local',
          voice: '',
        },
        scenes: [scene],
        durationMs: 6000,
        artifacts: {
          audio,
          subtitles,
          preview: 'old-preview.html',
          video: 'old.mp4',
        },
        events: [],
      };
      if (two) {
        const other = animationScene();
        other.id = 'other-page';
        other.cues = other.cues.map((c) => ({
          ...c,
          id: `other-${c.id}`,
          startMs: c.startMs! + 6000,
          endMs: c.endMs! + 6000,
        }));
        if (other.artwork?.version === 2)
          other.artwork.tracks = other.artwork.tracks.map(
            (t) =>
              ({
                ...t,
                keyframes: t.keyframes.map((k) => ({
                  ...k,
                  at: { ...k.at, cueId: `other-${k.at.cueId}` },
                })),
              }) as typeof t,
          );
        p.scenes.push(other);
        p.durationMs = 12000;
      }
      await productionStore(db).create(p);
      return p;
    }
    function operations(
      review: NonNullable<ProductionOperations['reviewScene']>,
      repair?: ProductionOperations['repairScene'],
    ) {
      const forbidden = vi.fn(async () => {
        throw new Error('Unexpected draw/narration/planning');
      });
      const ops: ProductionOperations = {
        plan: forbidden,
        script: forbidden,
        narrate: forbidden,
        illustrateScene: forbidden,
        render: forbidden,
        compose: async (p) => p,
        reviewScene: review,
        repairScene: repair,
      };
      return { ops, forbidden };
    }
    const runner = (ops: ProductionOperations) =>
      createProductionRunner(
        productionRunStore(db),
        () => ops,
        (e) => (e instanceof Error ? e.message : 'failure'),
      );
    const pass = {
      value: { pass: true, issues: [] },
      usage: { input: 3, output: 2 },
    };
    it('provider failure persists real PNG evidence; retry reuses same frames without redraw/TTS', async () => {
      const original = await fixture();
      const store = productionStore(db);
      let calls = 0;
      const inputs: string[][] = [];
      const model: VisionGenerator = {
        generate: async (_system, _user, images) => {
          calls++;
          inputs.push(images.map((i) => digest(Buffer.from(i.data, 'base64'))));
          expect(images.length).toBeGreaterThan(1);
          expect(
            Buffer.from(images[0].data, 'base64').subarray(1, 4).toString(),
          ).toBe('PNG');
          if (calls === 1) throw new Error('MODEL_AUTH_FAILED');
          return pass;
        },
      };
      const { ops, forbidden } = operations(sceneReviewer(root, {}, model));
      const run = runner(ops);
      const first = await store.claim(
        original.projectId,
        0,
        'illustrating',
        'illustrate',
        { illustrationSceneId: original.scenes[0].id, reviewMode: 'review' },
      );
      await expect(run(first.job.id)).rejects.toThrow(
        'REVIEW_MODEL_AUTH_FAILED',
      );
      const failed = (await store.get(original.projectId))!;
      expect(failed.stage).toBe('failed');
      expect(failed.scenes[0].review?.status).toBe('failed');
      expect(failed.scenes[0].review?.resume).toBe('checking');
      const frames = failed.scenes[0].review!.frames;
      expect(frames.length).toBeGreaterThan(1);
      const timestamps = await Promise.all(
        frames.map((f) => stat(join(root, f.key)).then((s) => s.mtimeMs)),
      );
      const second = await store.claim(
        original.projectId,
        failed.revision,
        'illustrating',
        'illustrate',
      );
      await run(second.job.id);
      const done = (await store.get(original.projectId))!;
      expect(done.scenes[0].review?.status).toBe('passed');
      expect(done.scenes[0].review?.frames).toEqual(frames);
      expect(inputs[1]).toEqual(inputs[0]);
      expect(
        await Promise.all(
          frames.map((f) => stat(join(root, f.key)).then((s) => s.mtimeMs)),
        ),
      ).toEqual(timestamps);
      expect(done.scenes[0].artwork).toEqual(original.scenes[0].artwork);
      expect(done.scenes[0].cues).toEqual(original.scenes[0].cues);
      expect(done.artifacts.audio).toBe(original.artifacts.audio);
      expect(forbidden).not.toHaveBeenCalled();
      expect(calls).toBe(2);
    }, 60000);
    it('visual rejection repairs one candidate, recaptures changed pixels and independently passes; preserves audio/cues', async () => {
      const original = await fixture(true);
      const store = productionStore(db);
      const beforeAudio = digest(
        await readFile(join(root, original.artifacts.audio!)),
      );
      const beforeSubs = digest(
        await readFile(join(root, original.artifacts.subtitles!)),
      );
      let calls = 0;
      const pixels: string[][] = [];
      const evidence: SceneReview[] = [];
      const prompts: any[] = [];
      const model: VisionGenerator = {
        generate: async (_system, user, images) => {
          calls++;
          prompts.push(JSON.parse(user));
          pixels.push(images.map((i) => digest(Buffer.from(i.data, 'base64'))));
          return calls === 1
            ? {
                value: {
                  pass: false,
                  issues: [
                    {
                      atMs: 1000,
                      elementIds: ['tank'],
                      what: '容器位置需要调整',
                      fix: '将容器向右移动20像素',
                    },
                  ],
                },
                usage: { input: 3, output: 2 },
              }
            : pass;
        },
      };
      const actual = sceneReviewer(root, {}, model);
      const review: NonNullable<ProductionOperations['reviewScene']> = async (
        p,
        i,
        s,
        checkpoint,
      ) => {
        const next = await actual(p, i, s, checkpoint);
        evidence.push(structuredClone(next.scenes[i].review!));
        return next;
      };
      const repair = vi.fn(async (p: Production, index: number) => {
        expect(p.scenes[index].review?.status).toBe('repairing');
        expect(p.scenes[index].review?.round).toBe(1);
        const next = structuredClone(p);
        const artwork = next.scenes[index].artwork;
        if (!isLegacyArtwork(artwork)) throw new Error('Expected legacy artwork');
        artwork.elements.find((e) => e.id === 'tank')!.x += 20;
        return next;
      });
      const { ops, forbidden } = operations(review, repair);
      // Explicit repair scope uses the standard illustrate mode; review-only deliberately does not auto-repair.
      const claim = await store.claim(
        original.projectId,
        0,
        'illustrating',
        'illustrate',
        { illustrationSceneId: original.scenes[0].id, reviewMode: 'review' },
      );
      const scoped = {
        ...claim.production,
        reviewTask: {
          sceneId: original.scenes[0].id,
          mode: 'illustrate' as const,
        },
      };
      await productionRunStore(db).checkpoint(scoped, claim.job.id, 1);
      await runner(ops)(claim.job.id);
      const done = (await store.get(original.projectId))!;
      expect(repair).toHaveBeenCalledTimes(1);
      expect(calls).toBe(2);
      expect(evidence.map((e) => e.status)).toEqual([
        'needs_attention',
        'passed',
      ]);
      expect(evidence[1].round).toBe(1);
      expect(evidence[1].fingerprint).not.toBe(evidence[0].fingerprint);
      expect(evidence[1].frames.map((f) => f.key)).not.toEqual(
        evidence[0].frames.map((f) => f.key),
      );
      expect(pixels[1]).not.toEqual(pixels[0]);
      expect(prompts[1].previousIssues).toHaveLength(1);
      expect(done.scenes[1]).toEqual(original.scenes[1]);
      expect(done.scenes[0].cues).toEqual(original.scenes[0].cues);
      expect(done.artifacts.audio).toBe(original.artifacts.audio);
      expect(done.artifacts.subtitles).toBe(original.artifacts.subtitles);
      expect(digest(await readFile(join(root, done.artifacts.audio!)))).toBe(
        beforeAudio,
      );
      expect(
        digest(await readFile(join(root, done.artifacts.subtitles!))),
      ).toBe(beforeSubs);
      expect(forbidden).not.toHaveBeenCalled();
    }, 60000);
    it('review-only claim retains existing preview and video', async () => {
      const original = await fixture();
      const claim = await productionStore(db).claim(
        original.projectId,
        0,
        'illustrating',
        'illustrate',
        { illustrationSceneId: original.scenes[0].id, reviewMode: 'review' },
      );
      expect(claim.production.artifacts).toEqual(original.artifacts);
    });
    it.each(['checking', 'repairing'] as const)(
      'explicit review retry resumes failed %s without discarding evidence or round budget',
      async (resume) => {
        const original = await fixture();
        const report: SceneReview = {
          fingerprint: 'retained-content-config-fingerprint',
          round: 2,
          status: 'failed',
          resume,
          error: 'REVIEW_MODEL_AUTH_FAILED',
          mode: 'visual',
          frames: [
            {
              key: `production/${original.projectId}/retained.png`,
              timeMs: 1000,
              cueId: 'pour',
            },
          ],
          issues: [],
          omittedCueIds: ['transfer'],
        };
        original.scenes[0].review = report;
        original.stage = 'failed';
        original.failedAction = 'illustrate';
        const store = productionStore(db);
        await store.save(original, 0);
        const claim = await store.claim(
          original.projectId,
          0,
          'illustrating',
          'illustrate',
          { illustrationSceneId: original.scenes[0].id, reviewMode: 'review' },
        );
        expect(claim.production.scenes[0].review).toMatchObject({
          fingerprint: report.fingerprint,
          frames: report.frames,
          round: 2,
          status: resume,
          omittedCueIds: report.omittedCueIds,
        });
        expect(claim.production.scenes[0].review?.error).toBeUndefined();
      },
    );
    it('matching needs_attention evidence is cached without another vision call', async () => {
      const original = await fixture();
      const generate = vi.fn(async () => ({
        value: {
          pass: false,
          issues: [
            {
              atMs: 1000,
              elementIds: ['tank'],
              what: '容器位置需要调整',
              fix: '将容器右移',
            },
          ],
        },
        usage: { input: 3, output: 2 },
      }));
      const review = sceneReviewer(root, {}, { generate });
      const checked = await review(original, 0, AbortSignal.timeout(30000));
      expect(checked.scenes[0].review?.status).toBe('needs_attention');
      expect(checked.scenes[0].review?.frames.length).toBeGreaterThan(1);
      const repeated = await review(checked, 0, AbortSignal.timeout(30000));
      expect(generate).toHaveBeenCalledTimes(1);
      expect(repeated).toEqual(checked);
    }, 60000);
    it('DB review claims preserve artwork/other reports; repair starts round one and stale owner cannot checkpoint', async () => {
      const original = await fixture(true),
        store = productionStore(db),
        runs = productionRunStore(db);
      const report: SceneReview = {
        fingerprint: 'test-fingerprint',
        round: 2,
        status: 'needs_attention',
        mode: 'visual',
        frames: [],
        issues: [],
        omittedCueIds: [],
      };
      original.scenes.forEach((s) => (s.review = structuredClone(report)));
      await store.save(original, 0);
      const first = await store.claim(
        original.projectId,
        0,
        'illustrating',
        'illustrate',
        { illustrationSceneId: original.scenes[0].id, reviewMode: 'review' },
      );
      expect(first.production.scenes[0].review).toBeUndefined();
      expect(first.production.scenes[0].artwork).toEqual(
        original.scenes[0].artwork,
      );
      expect(first.production.scenes[1]).toEqual(original.scenes[1]);
      expect(first.production.artifacts).toEqual(original.artifacts);
      await expect(
        store.claim(original.projectId, 0, 'illustrating', 'illustrate'),
      ).rejects.toThrow();
      await runs.complete(
        { ...first.production, stage: 'ready', scenes: original.scenes },
        first.job.id,
      );
      const second = await store.claim(
        original.projectId,
        first.production.revision,
        'illustrating',
        'illustrate',
        { illustrationSceneId: original.scenes[0].id, reviewMode: 'repair' },
      );
      expect(second.production.scenes[0].review).toMatchObject({
        round: 1,
        status: 'repairing',
      });
      expect(second.production.scenes[1]).toEqual(original.scenes[1]);
      expect(second.production.scenes[0].artwork).toEqual(
        original.scenes[0].artwork,
      );
      await expect(
        runs.checkpoint(first.production, first.job.id, 50),
      ).rejects.toThrow('任务版本已失效');
      expect((await store.get(original.projectId))?.jobId).toBe(second.job.id);
      await runs.fail(
        second.production,
        second.job.id,
        'illustrate',
        testFailure('owned test cleanup'),
      );
    });
  },
);
