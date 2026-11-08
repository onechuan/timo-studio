import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { ProjectService } from '@timotv/core';
import { projectRoutes } from './routes/projects.js';
import { errors } from './middleware/errors.js';
export function createApp(
  service: ProjectService,
  health: () => Promise<void>,
) {
  const app = new Hono();
  app.onError(errors);
  app.use('*', bodyLimit({ maxSize: 1024 * 1024 }));
  app.get('/api/health', async (c) => {
    await health();
    return c.json({ status: 'ok', service: 'timotv-api' });
  });
  app.route('/api', projectRoutes(service));
  app.notFound((c) =>
    c.json({ error: { code: 'NOT_FOUND', message: '接口不存在' } }, 404),
  );
  return app;
}
