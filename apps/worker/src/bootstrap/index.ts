import { LocalSettingsStore } from '@timotv/storage';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import {
  PrismaClient,
  repository,
  reconcileProductionQueue,
  failProductionJob,
} from '@timotv/db';
import { resolve } from 'node:path';
import { productionHandler, filmFailure } from '../handlers/production.js';
import { diagnosticWorker, filmWorker, filmQueue } from '@timotv/queue';
import { diagnosticHandler } from '../handlers/diagnostic.js';
import { createBrowserRuntime, preflightFfmpeg } from '@timotv/renderer';
config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
  quiet: true,
});

const transientStartupError = (error: unknown) =>
  /ECONN|ENOTFOUND|ETIMEDOUT|connection|connect|P1001|P1002|Redis|ready/i.test(
    error instanceof Error ? error.message : String(error),
  );

export async function retryStartupCheck(
  component: string,
  check: () => Promise<void>,
  options: {
    attempts?: number;
    sleep?: (delayMs: number) => Promise<void>;
  } = {},
) {
  const attempts = options.attempts ?? 5;
  const sleep =
    options.sleep ??
    ((delayMs: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, delayMs)));
  for (let attempt = 0; ; attempt++) {
    try {
      await check();
      return;
    } catch (error) {
      if (attempt + 1 >= attempts || !transientStartupError(error)) throw error;
      const delayMs = Math.min(500 * 2 ** attempt, 5000);
      console.error(
        JSON.stringify({
          component,
          code: 'STARTUP_DEPENDENCY_RETRY',
          attempt: attempt + 1,
        }),
      );
      await sleep(delayMs);
    }
  }
}

export async function bootstrap(): Promise<{
  db: PrismaClient;
  worker: { close(force?: boolean): Promise<void> };
  films: { close(force?: boolean): Promise<void> };
}> {
  if (!process.env.DATABASE_URL || !process.env.REDIS_URL)
    throw new Error('CONFIG_MISSING: DATABASE_URL / REDIS_URL');
  const db = new PrismaClient();
  const queue = filmQueue(process.env.REDIS_URL);
  const browser = createBrowserRuntime({ phase: 'reviewing' });
  try {
    await retryStartupCheck('database', () => db.$connect());
    await retryStartupCheck('queue', () => queue.health());
    await retryStartupCheck('browser', () => browser.preflight());
    await retryStartupCheck('ffmpeg', preflightFfmpeg);
  } catch (error) {
    await Promise.allSettled([browser.close(), queue.close(), db.$disconnect()]);
    throw error;
  }
  await browser.close();
  const worker = diagnosticWorker(
    process.env.REDIS_URL,
    diagnosticHandler(repository(db)),
  );
  worker.on('error', () =>
    console.error('WORKER_CONNECTION_ERROR: 请检查 Redis / 数据库'),
  );
  worker.on('failed', () => console.error('DIAGNOSTIC_FAILED: 请查询任务记录'));
  const films = filmWorker(
    process.env.REDIS_URL,
    productionHandler(
      db,
      resolve(
        fileURLToPath(new URL('../../../../', import.meta.url)),
        process.env.STORAGE_ROOT || '.data/assets',
      ),
      undefined,
      () =>
        new LocalSettingsStore(
          fileURLToPath(
            new URL('../../../../.data/config/settings.json', import.meta.url),
          ),
        ).runtimeEnv(),
    ),
  );
  films.on('error', () => console.error('PRODUCTION_CONNECTION_ERROR'));
  films.on('failed', (job, error) => {
    if (job)
      void failProductionJob(
        db,
        job.data.id,
        filmFailure(error, { phase: 'queue' }),
      ).catch(() => console.error('PRODUCTION_FAILURE_PERSISTENCE_ERROR'));
  });
  const reconcile = () =>
    reconcileProductionQueue(db, queue).catch(() =>
      console.error('PRODUCTION_RECOVERY_ERROR'),
    );
  await reconcile();
  const recoveryTimer = setInterval(reconcile, 15000);
  recoveryTimer.unref();
  films.on('closed', () => {
    clearInterval(recoveryTimer);
    void queue.close();
  });
  await Promise.all([worker.waitUntilReady(), films.waitUntilReady()]);
  return { db, worker, films };
}
