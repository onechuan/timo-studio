import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { PrismaClient, repository } from '@timotv/db';
import { taskQueue } from '@timotv/queue';
import { ProjectService } from '@timotv/core';
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
  return {
    db,
    queue,
    service: new ProjectService(repository(db), queue),
    port: env.PORT,
  };
}
