import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { PrismaClient, repository, productionStore } from '@timotv/db';
import { LocalSettingsStore } from '@timotv/storage';
import { modelConfig } from '@timotv/agent';
import { resolve } from 'node:path';
import { taskQueue, filmQueue } from '@timotv/queue';
import { ProductionService, ProjectService } from '@timotv/core';
import { createBrowserRuntime, preflightFfmpeg } from '@timotv/renderer';
config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
  quiet: true,
});
export function bootstrap() {
  const parsed = z
    .object({
      DATABASE_URL: z.string().url(),
      REDIS_URL: z.string().url(),
      PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    })
    .safeParse(process.env);
  if (!parsed.success)
    throw new Error('CONFIG_MISSING: 请检查 DATABASE_URL、REDIS_URL 和 PORT');
  const env = parsed.data;
  const db = new PrismaClient();
  const queue = taskQueue(env.REDIS_URL);
  const films = filmQueue(env.REDIS_URL);
  const settings = new LocalSettingsStore(
    fileURLToPath(
      new URL('../../../../.data/config/settings.json', import.meta.url),
    ),
  );
  const production = new ProductionService(
    productionStore(db),
    films,
    async () => {
      const env = await settings.runtimeEnv();
      const m = modelConfig(env);
      const check = async (run: () => Promise<void>, code: string) => {
        try {
          await run();
          return { ready: true };
        } catch {
          return { ready: false, code };
        }
      };
      const browser = createBrowserRuntime({ phase: 'reviewing' });
      const [database, queueStatus, browserStatus, ffmpegStatus] =
        await Promise.all([
          check(async () => {
            await db.$queryRaw`SELECT 1`;
          }, 'DATABASE_UNAVAILABLE'),
          check(() => films.health(), 'QUEUE_UNAVAILABLE'),
          check(() => browser.preflight(), 'REVIEW_BROWSER_MISSING').finally(
            () => browser.close(),
          ),
          check(preflightFfmpeg, 'FFMPEG_MISSING'),
        ]);
      return {
        model: {
          configured: !!(m.key && m.model),
          provider: m.provider,
          model: m.model,
        },
        voices: {
          volcengine: !!(
            env.VOLCENGINE_TTS_API_KEY ||
            (env.VOLCENGINE_TTS_APP_ID && env.VOLCENGINE_TTS_ACCESS_TOKEN)
          ),
          local: process.platform === 'darwin',
          elevenlabs: !!env.ELEVENLABS_API_KEY,
        },
        runtime: {
          database,
          queue: queueStatus,
          browser: browserStatus,
          ffmpeg: ffmpegStatus,
        },
      };
    },
    (id) =>
      db.project
        .findUnique({ where: { id } })
        .then((p) =>
          p ? { aspectRatio: p.aspectRatio as '16:9' | '9:16' } : null,
        ),
    async () => (await settings.get()).production.videoPipeline,
  );
  return {
    settings,
    db,
    queue,
    films,
    production: {
      service: production,
      root: resolve(
        fileURLToPath(new URL('../../../../', import.meta.url)),
        process.env.STORAGE_ROOT || '.data/assets',
      ),
    },
    service: new ProjectService(repository(db), queue),
    port: env.PORT,
  };
}
