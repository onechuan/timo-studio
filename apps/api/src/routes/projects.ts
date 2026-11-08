import { Hono } from 'hono';
import { z } from 'zod';
import type { ProjectService } from '@timotv/core';
const id = (s: string) => z.string().uuid().parse(s);
export function projectRoutes(service: ProjectService) {
  const app = new Hono();
  app.get('/projects', async (c) => c.json(await service.list()));
  app.post('/projects', async (c) =>
    c.json(await service.create(await c.req.json()), 201),
  );
  app.get('/projects/:id', async (c) =>
    c.json(await service.get(id(c.req.param('id')))),
  );
  app.patch('/projects/:id', async (c) =>
    c.json(await service.rename(id(c.req.param('id')), await c.req.json())),
  );
  app.get('/projects/:id/timeline', async (c) =>
    c.json(await service.timeline(id(c.req.param('id')))),
  );
  app.put('/projects/:id/timeline', async (c) =>
    c.json(
      await service.saveTimeline(id(c.req.param('id')), await c.req.json()),
    ),
  );
  app.post('/projects/:id/diagnostics', async (c) =>
    c.json(await service.diagnose(id(c.req.param('id'))), 202),
  );
  app.get('/jobs/:id', async (c) =>
    c.json(await service.job(id(c.req.param('id')))),
  );
  return app;
}
