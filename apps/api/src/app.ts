import type { LocalSettingsStore } from '@timotv/storage';
import { settingsRoutes } from './routes/settings.js';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { ProductionService, ProjectService } from '@timotv/core';
import { projectRoutes } from './routes/projects.js';
import { productionRoutes } from './routes/production.js';
import { errors } from './middleware/errors.js';
export function createApp(
  service: ProjectService,
  health: () => Promise<void>,
  production?: { service: ProductionService; root: string },
  settings?: LocalSettingsStore,
) {
  const app = new Hono();
  app.onError(errors);
  app.use('*', bodyLimit({ maxSize: 1024 * 1024 }));
  app.get('/api/health', async (c) => {
    await health();
    return c.json({ status: 'ok', service: 'timotv-api' });
  });
  app.route('/api', projectRoutes(service));
  if (settings) app.route('/api/settings', settingsRoutes(settings));
  if (production)
    app.route('/api', productionRoutes(production.service, production.root));
  app.notFound((c) =>
    c.json({ error: { code: 'NOT_FOUND', message: '接口不存在' } }, 404),
  );
  return app;
}
