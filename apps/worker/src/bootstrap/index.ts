import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { PrismaClient, repository } from '@timotv/db';
import { diagnosticWorker } from '@timotv/queue';
import { diagnosticHandler } from '../handlers/diagnostic.js';
config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
  quiet: true,
});
export async function bootstrap() {
  if (!process.env.DATABASE_URL || !process.env.REDIS_URL)
    throw new Error('CONFIG_MISSING: DATABASE_URL / REDIS_URL');
  const db = new PrismaClient();
  await db.$connect();
  const worker = diagnosticWorker(
    process.env.REDIS_URL,
    diagnosticHandler(repository(db)),
  );
  worker.on('error', () =>
    console.error('WORKER_CONNECTION_ERROR: 请检查 Redis / 数据库'),
  );
  worker.on('failed', () => console.error('DIAGNOSTIC_FAILED: 请查询任务记录'));
  await worker.waitUntilReady();
  return { db, worker };
}
