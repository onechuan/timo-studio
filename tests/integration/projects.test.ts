import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { loadEnvFile } from 'node:process';
import { randomUUID } from 'node:crypto';
import { PrismaClient, repository } from '../../packages/db/src/index.js';
import { ProjectService } from '../../packages/core/dist/index.js';
import { taskQueue } from '../../packages/queue/src/index.js';
import { createApp } from '../../apps/api/src/app.js';
import { spawn, type ChildProcess } from 'node:child_process';
loadEnvFile();
describe.skipIf(process.env.RUN_INTEGRATION !== '1')(
  '真实 PostgreSQL / Redis / 独立 Worker',
  () => {
    const db = new PrismaClient(),
      queue = taskQueue(process.env.REDIS_URL!);
    const service = new ProjectService(repository(db), queue);
    const app = createApp(service, async () => {
      await db.$queryRaw`SELECT 1`;
      await queue.health();
    });
    const ids: string[] = [];
    let worker: ChildProcess;
    beforeAll(async () => {
      await db.$connect();
      await queue.health();
      worker = spawn(
        process.execPath,
        ['--import', 'tsx', 'apps/worker/src/index.ts'],
        { env: process.env, stdio: 'pipe' },
      );
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Worker startup timeout')),
          15000,
        );
        worker.stdout!.on('data', (d) => {
          if (d.toString().includes('worker ready')) {
            clearTimeout(timeout);
            resolve();
          }
        });
        worker.on('exit', (code) => {
          clearTimeout(timeout);
          reject(new Error('Worker exited ' + code));
        });
      });
    });
    afterAll(async () => {
      if (worker && !worker.killed) {
        worker.kill('SIGTERM');
        await new Promise<void>((resolve) =>
          worker.once('exit', () => resolve()),
        );
      }
      await queue.close();
      await db.project.deleteMany({ where: { id: { in: ids } } });
      await db.$disconnect();
    });
    async function request(path: string, method = 'GET', body?: unknown) {
      return app.request('/api' + path, {
        method,
        ...(body
          ? {
              body: JSON.stringify(body),
              headers: { 'Content-Type': 'application/json' },
            }
          : {}),
      });
    }
    async function create() {
      const res = await request('/projects', 'POST', {
        title: '集成测试 ' + randomUUID(),
        kind: 'edited',
        aspectRatio: '16:9',
      });
      expect(res.status).toBe(201);
      const p = await res.json();
      ids.push(p.id);
      return p;
    }
    it('health 真实依赖就绪', async () =>
      expect((await request('/health')).status).toBe(200));
    it('创建、读取、标题和时间轴持久化，并拒绝旧 revision', async () => {
      const p = await create();
      expect((await (await request('/projects/' + p.id)).json()).title).toBe(
        p.title,
      );
      expect(
        (await request('/projects/' + p.id, 'PATCH', { title: '已持久化' }))
          .status,
      ).toBe(200);
      expect(
        (await db.project.findUniqueOrThrow({ where: { id: p.id } })).title,
      ).toBe('已持久化');
      const t = await (await request('/projects/' + p.id + '/timeline')).json();
      expect(t.videoClips).toEqual([]);
      t.subtitles = [
        { id: randomUUID(), startMs: 0, endMs: 1000, text: '持久化字幕' },
      ];
      expect(
        (await request('/projects/' + p.id + '/timeline', 'PUT', t)).status,
      ).toBe(200);
      const loaded = await (
        await request('/projects/' + p.id + '/timeline')
      ).json();
      expect(loaded.revision).toBe(1);
      expect(loaded.subtitles[0].text).toBe('持久化字幕');
      expect(
        (await request('/projects/' + p.id + '/timeline', 'PUT', t)).status,
      ).toBe(409);
      expect((await repository(db).timeline(p.id))?.revision).toBe(1);
    });
    it('拒绝跨项目素材及超出时长', async () => {
      const a = await create(),
        b = await create();
      const asset = await db.asset.create({
        data: {
          projectId: a.id,
          kind: 'video',
          originalName: 'fixture.mp4',
          storageKey: randomUUID(),
          durationMs: 1000,
          mimeType: 'video/mp4',
        },
      });
      const t = await service.timeline(b.id);
      const clip = {
        id: randomUUID(),
        assetId: asset.id,
        kind: 'video',
        timelineStartMs: 0,
        sourceInMs: 0,
        sourceOutMs: 1000,
        volume: 1,
      };
      expect(
        (
          await request('/projects/' + b.id + '/timeline', 'PUT', {
            ...t,
            videoClips: [clip],
          })
        ).status,
      ).toBe(400);
      const own = await service.timeline(a.id);
      expect(
        (
          await request('/projects/' + a.id + '/timeline', 'PUT', {
            ...own,
            videoClips: [{ ...clip, sourceOutMs: 1001 }],
          })
        ).status,
      ).toBe(400);
      expect(
        (
          await request('/projects/' + a.id + '/timeline', 'PUT', {
            ...own,
            videoClips: [clip],
          })
        ).status,
      ).toBe(200);
    });
    it('并发保存只有一个成功', async () => {
      const p = await create();
      const t = await service.timeline(p.id);
      const results = await Promise.all([
        request('/projects/' + p.id + '/timeline', 'PUT', t),
        request('/projects/' + p.id + '/timeline', 'PUT', t),
      ]);
      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    });
    it('诊断任务通过独立进程执行并持久化 succeeded', async () => {
      const p = await create();
      const res = await request('/projects/' + p.id + '/diagnostics', 'POST');
      expect(res.status).toBe(202);
      const j = await res.json();
      await expect
        .poll(
          async () =>
            (await db.job.findUniqueOrThrow({ where: { id: j.id } })).status,
          { timeout: 15000 },
        )
        .toBe('succeeded');
      const saved = await service.job(j.id);
      expect(saved.progress).toBe(100);
      expect(saved.startedAt).not.toBeNull();
      expect(saved.finishedAt).not.toBeNull();
    });
  },
);
