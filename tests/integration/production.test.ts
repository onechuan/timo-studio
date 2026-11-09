import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadEnvFile } from 'node:process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, stat, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  PrismaClient,
  productionStore,
  productionRunStore,
} from '../../packages/db/src/index.js';
import { ProductionService } from '../../packages/core/src/production/service.js';
import { filmQueue, filmWorker } from '../../packages/queue/src/index.js';
import { productionHandler } from '../../apps/worker/src/handlers/production.js';
import type { JsonGenerator } from '../../packages/agent/src/director/index.js';
import { isLegacyArtwork } from '../../packages/contracts/src/artwork.js';
loadEnvFile();
describe.skipIf(process.env.RUN_INTEGRATION !== '1')(
  '制作链路：测试模型 + 真实 PostgreSQL/Redis/系统配音/Chrome/FFmpeg',
  () => {
    const db = new PrismaClient();
    const ids: string[] = [];
    const queue = filmQueue(
      process.env.REDIS_URL!,
      'timotv-test-' + randomUUID(),
    );
    let root: string;
    let worker: ReturnType<typeof filmWorker>;
    let service: ProductionService;
    const generatedPrompts: string[] = [];
    // The only synthetic dependency is model content; this fixture is never reachable from production configuration.
    const model: JsonGenerator = {
      async generate(system, user) {
        generatedPrompts.push(system);
        const scene = {
          id: 'p01',
          title: '种子成长',
          visual: '种子长成树',
          beats: ['种子', '萌芽'],
        };
        return {
          value: system.includes('手绘动画导演')
            ? {
                sceneId: JSON.parse(user).sceneId,
                artwork: {
                  version: 1,
                  intent: '一棵大树展示生长',
                  elements: [
                    {
                      id: 'tree',
                      type: 'illustration',
                      name: 'tree',
                      x: 500,
                      y: 220,
                      width: 400,
                      height: 450,
                      cueIndex: 0,
                    },
                  ],
                },
              }
            : system.includes('口播编剧')
              ? {
                  scenes: [
                    {
                      ...scene,
                      cues: [{ id: 'p01-c0', text: '种子长大了。' }],
                    },
                  ],
                }
              : {
                  title: '种子的变化',
                  summary: '观察生长',
                  scenes: [{ ...scene, say: '解释生长' }],
                },
          usage: { input: 10, output: 10 },
        };
      },
    };
    beforeAll(async () => {
      root = await mkdtemp(join(tmpdir(), 'timo-pipeline-'));
      service = new ProductionService(
        productionStore(db),
        queue,
        {
          model: { configured: true, provider: 'test', model: 'fixture' },
          voices: { volcengine: false, local: true, elevenlabs: false },
        },
        (id) =>
          db.project
            .findUnique({ where: { id } })
            .then((p) =>
              p ? { aspectRatio: p.aspectRatio as '16:9' | '9:16' } : null,
            ),
      );
      // The queue's isolated name keeps test workers from consuming actual studio jobs.
      worker = filmWorker(
        process.env.REDIS_URL!,
        productionHandler(db, root, model),
        queue.queueName,
      );
      worker.on('error', () => {});
      await worker.waitUntilReady();
    });
    afterAll(async () => {
      await worker?.close();
      await queue.close();
      await db.project.deleteMany({ where: { id: { in: ids } } });
      await db.$disconnect();
      if (root) await rm(root, { recursive: true, force: true });
    });
    async function project() {
      const p = await db.project.create({
        data: { title: '制作集成测试', kind: 'generated', aspectRatio: '16:9' },
      });
      ids.push(p.id);
      return p;
    }
    async function settled(id: string, expected: string) {
      await expect
        .poll(
          async () => {
            const p = await service.get(id);
            return p?.jobId ? 'working' : p?.stage;
          },
          { timeout: 60000, interval: 100 },
        )
        .toBe(expected);
      return (await service.get(id))!;
    }
    it('主题到分镜审批、自动口播、配音、预览与真实视频，刷新可恢复', async () => {
      const p = await project();
      let doc = await service.create(p.id, {
        topic: '解释种子发芽',
        contentType: 'explainer',
        voiceProvider: 'local',
        durationSec: 15,
      });
      await expect(
        service.act(p.id, { revision: 0, action: 'approve' }),
      ).rejects.toMatchObject({ code: 'INVALID_STAGE' });
      await service.act(p.id, { revision: doc.revision, action: 'plan' });
      doc = await settled(p.id, 'approval');
      expect(doc.scenes).toEqual([]);
      expect(doc.artifacts.audio).toBeUndefined();
      await service.act(p.id, { revision: doc.revision, action: 'approve' });
      doc = await settled(p.id, 'ready');
      expect(doc.scenes[0].cues[0].text).toBe('种子长大了。');
      expect(doc.brief.contentType).toBe('explainer');
      expect(generatedPrompts.slice(0, 2)).toHaveLength(2);
      expect(generatedPrompts[0]).toContain('# 科普口播');
      expect(generatedPrompts[0]).toContain('## 分镜参考');
      expect(generatedPrompts[1]).toContain('# 科普口播');
      expect(generatedPrompts[1]).toContain('## 口播参考');
      if (!isLegacyArtwork(doc.scenes[0].artwork))
        throw new Error('Expected legacy artwork');
      expect(doc.scenes[0].artwork.elements[0].type).toBe('illustration');
      expect(doc.durationMs).toBeGreaterThan(500);
      expect(
        (await stat(join(root, doc.artifacts.audio!))).size,
      ).toBeGreaterThan(1000);
      expect(
        await readFile(join(root, doc.artifacts.subtitles!), 'utf8'),
      ).toContain('种子长大了。');
      // Redrawing advances the revision while using the exact measured audio/cues from the prior one.
      const priorAudio = doc.artifacts.audio,
        priorSubtitles = doc.artifacts.subtitles;
      const priorCues = structuredClone(doc.scenes[0].cues);
      const priorRevision = doc.revision;
      await service.act(p.id, { revision: doc.revision, action: 'illustrate' });
      doc = await settled(p.id, 'ready');
      expect(doc.revision).toBe(priorRevision + 1);
      expect(doc.artifacts.audio).toBe(priorAudio);
      expect(doc.artifacts.subtitles).toBe(priorSubtitles);
      expect(doc.scenes[0].cues).toEqual(priorCues);
      expect(
        await readFile(join(root, doc.artifacts.preview!), 'utf8'),
      ).toContain('audio');
      const revision = doc.revision,
        audio = doc.artifacts.audio;
      await service.act(p.id, { revision, action: 'export' });
      doc = await settled(p.id, 'ready');
      expect(doc.revision).toBe(revision);
      expect(doc.artifacts.audio).toBe(audio);
      expect(
        (await stat(join(root, doc.artifacts.video!))).size,
      ).toBeGreaterThan(1000);
      const ffmpeg = createRequire(import.meta.url)(
        '../../packages/renderer/node_modules/ffmpeg-static',
      );
      const info = await new Promise<string>((resolve, reject) => {
        const child = spawn(ffmpeg, ['-i', join(root, doc.artifacts.video!)]);
        let s = '';
        child.stderr.on('data', (b) => (s += b));
        child.on('error', reject);
        child.on('close', () => resolve(s));
      });
      expect(info).toContain('1920x1080');
      expect(info).toContain('Audio: aac');
      expect((await productionStore(db).get(p.id))?.artifacts.video).toBe(
        doc.artifacts.video,
      );
    }, 90000);
    it('draw claims clear artwork only for fresh requests and retain checkpoints on failure retry', async () => {
      const projectRow = await project();
      const doc = await service.create(projectRow.id, { topic: '绘图恢复' });
      const store = productionStore(db);
      const artwork = {
        version: 1 as const,
        intent: '杯子',
        elements: [
          {
            id: 'cup',
            type: 'illustration' as const,
            name: 'cup' as const,
            x: 400,
            y: 200,
            width: 400,
            height: 400,
            cueIndex: 0,
            transition: 'rise' as const,
            fill: 'accent' as const,
            stroke: 'none' as const,
            strokeWidth: 3,
            opacity: 1,
          },
        ],
      };
      const measured = {
        ...doc,
        revision: 1,
        stage: 'ready' as const,
        durationMs: 1000,
        timingSource: 'audio-per-cue' as const,
        artifacts: {
          audio: 'production/old/audio.wav',
          subtitles: 'old.srt',
          preview: 'old.html',
          video: 'old.mp4',
        },
        scenes: [
          {
            id: 's',
            title: '杯子',
            visual: '杯外水滴',
            beats: ['杯'],
            artwork,
            cues: [
              {
                id: 'c',
                text: '水滴',
                startMs: 0,
                endMs: 1000,
                audioKey: 'cue.wav',
              },
            ],
          },
        ],
      };
      await store.save(measured, 0);
      const fresh = await store.claim(
        doc.projectId,
        1,
        'illustrating',
        'illustrate',
      );
      expect(fresh.production.scenes[0].artwork).toBeUndefined();
      expect(fresh.production.artifacts).toEqual({
        audio: measured.artifacts.audio,
        subtitles: 'old.srt',
      });
      const checkpoint = { ...fresh.production, scenes: measured.scenes };
      await productionRunStore(db).checkpoint(checkpoint, fresh.job.id, 80);
      await productionRunStore(db).fail(
        checkpoint,
        fresh.job.id,
        'illustrate',
        'safe',
      );
      const retry = await store.claim(
        doc.projectId,
        2,
        'illustrating',
        'illustrate',
      );
      expect(retry.production.scenes).toEqual(measured.scenes);
      expect(retry.production.durationMs).toBe(1000);
      await productionRunStore(db).fail(
        retry.production,
        retry.job.id,
        'illustrate',
        'safe',
      );
      const restart = await store.claim(
        doc.projectId,
        retry.production.revision,
        'illustrating',
        'illustrate',
        { restartIllustration: true },
      );
      expect(restart.production.scenes[0].artwork).toBeUndefined();
      expect(restart.production.scenes[0].cues).toEqual(
        measured.scenes[0].cues,
      );
      expect(restart.production.artifacts.audio).toBe(measured.artifacts.audio);
      await productionRunStore(db).complete(
        { ...restart.production, stage: 'ready' },
        restart.job.id,
      );
    });
    it('selected-page redraw preserves other pages and measured audio even after a failure', async () => {
      const projectRow = await project();
      const doc = await service.create(projectRow.id, { topic: '单页重画' });
      const store = productionStore(db);
      const artwork = {
        version: 1 as const,
        intent: '牛',
        elements: [
          {
            id: 'cow',
            type: 'illustration' as const,
            name: 'cow' as const,
            x: 100,
            y: 200,
            width: 400,
            height: 300,
            cueIndex: 0,
            transition: 'rise' as const,
            fill: 'accent' as const,
            stroke: 'none' as const,
            strokeWidth: 3,
            opacity: 1,
          },
        ],
      };
      const measured = {
        ...doc,
        revision: 1,
        stage: 'failed' as const,
        failedAction: 'illustrate' as const,
        durationMs: 2000,
        artifacts: {
          audio: 'old.wav',
          subtitles: 'old.srt',
          preview: 'old.html',
          video: 'old.mp4',
        },
        scenes: ['one', 'two'].map((id, i) => ({
          id,
          title: id,
          visual: '牛',
          beats: ['牛'],
          artwork,
          cues: [
            {
              id: `${id}-c`,
              text: '牛',
              startMs: i * 1000,
              endMs: (i + 1) * 1000,
            },
          ],
        })),
      };
      await store.save(measured, 0);
      const selected = await store.claim(
        doc.projectId,
        1,
        'illustrating',
        'illustrate',
        { illustrationSceneId: 'two' },
      );
      expect(selected.production.scenes[0]).toEqual(measured.scenes[0]);
      expect(selected.production.scenes[1].artwork).toBeUndefined();
      expect(selected.production.scenes[1].cues).toEqual(
        measured.scenes[1].cues,
      );
      expect(selected.production.artifacts).toEqual({
        audio: 'old.wav',
        subtitles: 'old.srt',
      });
      expect(selected.production.durationMs).toBe(2000);
      await productionRunStore(db).complete(
        { ...selected.production, stage: 'ready' },
        selected.job.id,
      );
    });
    it('配置读取失败会释放任务锁并仅持久化安全错误', async () => {
      const p = await project();
      const doc = await service.create(p.id, { topic: '配置读取失败测试' });
      const claimed = await productionStore(db).claim(
        p.id,
        doc.revision,
        'planning',
        'plan',
      );
      const handler = productionHandler(db, root, model, async () => {
        throw new Error('SETTINGS_READ_FAILED');
      });
      await expect(handler(claimed.job.id)).rejects.toThrow('制作失败');
      const failed = await productionStore(db).get(p.id);
      expect(failed?.stage).toBe('failed');
      expect(failed?.jobId).toBeUndefined();
      const job = await db.job.findUniqueOrThrow({
        where: { id: claimed.job.id },
      });
      expect(job.status).toBe('failed');
      expect(job.errorMessage).not.toContain('SETTINGS_READ_FAILED');
      expect(failed?.error).toBe(job.errorMessage);
      expect(
        (await db.production.findUniqueOrThrow({ where: { projectId: p.id } }))
          .jobId,
      ).toBeNull();
    });
    it('run adapter guards stale owners and terminal jobs atomically', async () => {
      const projectRow = await project();
      await service.create(projectRow.id, { topic: 'ownership' });
      const claimed = await productionStore(db).claim(
        projectRow.id,
        0,
        'planning',
        'plan',
      );
      const runs = productionRunStore(db);
      const p = claimed.production,
        id = claimed.job.id;
      await runs.start(p, id);
      await runs.checkpoint(
        { ...p, brief: { ...p.brief, topic: 'checkpoint' } },
        id,
        42,
      );
      expect((await db.job.findUniqueOrThrow({ where: { id } })).progress).toBe(
        42,
      );
      expect((await productionStore(db).get(p.projectId))?.brief.topic).toBe(
        'checkpoint',
      );
      await expect(
        runs.checkpoint({ ...p, revision: p.revision - 1 }, id, 80),
      ).rejects.toThrow();
      await runs.fail({ ...p, revision: p.revision - 1 }, id, 'plan', 'safe');
      expect((await db.job.findUniqueOrThrow({ where: { id } })).status).toBe(
        'running',
      );
      await db.job.update({ where: { id }, data: { status: 'succeeded' } });
      await expect(
        runs.checkpoint({ ...p, brief: { ...p.brief, topic: 'bad' } }, id, 80),
      ).rejects.toThrow();
      expect((await productionStore(db).get(p.projectId))?.brief.topic).toBe(
        'checkpoint',
      );
      await runs.fail(p, id, 'plan', 'safe');
      expect((await productionStore(db).get(p.projectId))?.jobId).toBe(id);
      await db.job.update({ where: { id }, data: { status: 'running' } });
      const replacement = await db.job.create({
        data: { projectId: p.projectId, type: 'plan' },
      });
      await db.production.update({
        where: { projectId: p.projectId },
        data: { jobId: replacement.id },
      });
      await runs.fail(p, id, 'plan', 'safe');
      await expect(runs.checkpoint(p, id, 80)).rejects.toThrow();
      expect(
        (
          await db.production.findUniqueOrThrow({
            where: { projectId: p.projectId },
          })
        ).jobId,
      ).toBe(replacement.id);
      expect((await db.job.findUniqueOrThrow({ where: { id } })).status).toBe(
        'running',
      );
      await db.production.update({
        where: { projectId: p.projectId },
        data: { jobId: id },
      });
      await runs.complete(p, id);
      await runs.fail(p, id, 'plan', 'safe');
      await expect(runs.checkpoint(p, id, 20)).rejects.toThrow();
      expect((await db.job.findUniqueOrThrow({ where: { id } })).status).toBe(
        'succeeded',
      );
    });
    it('并发提交只允许一个任务占用项目；旧修订不能覆盖', async () => {
      const p = await project();
      await service.create(p.id, { topic: '复利' });
      const results = await Promise.allSettled([
        service.act(p.id, { revision: 0, action: 'plan' }),
        service.act(p.id, { revision: 0, action: 'plan' }),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      await settled(p.id, 'approval');
      await expect(
        service.update(p.id, { revision: 0, brief: { topic: '覆盖' } }),
      ).rejects.toMatchObject({ code: 'REVISION_CONFLICT' });
    });
  },
);
