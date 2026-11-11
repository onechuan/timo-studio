import { serve } from '@hono/node-server';
import { bootstrap } from './bootstrap/index.js';
import { createApp } from './app.js';
const { db, queue, films, production, service, port, settings } = bootstrap();
const app = createApp(
  service,
  async () => {
    await db.$queryRaw`SELECT 1`;
    await queue.health();
  },
  production,
  settings,
);
const server = serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, () =>
  console.log(`TimoTV API http://127.0.0.1:${port}`),
);
for (const sig of ['SIGINT', 'SIGTERM'])
  process.on(sig, () => {
    server.close(async () => {
      await queue.close();
      await films.close();
      await db.$disconnect();
      process.exit(0);
    });
  });
