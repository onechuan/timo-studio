import { it, expect } from 'vitest';
import { createApp } from '../apps/api/src/app.js';
import { ProjectService } from '../packages/core/dist/index.js';
import type {
  ProjectRepository,
  TaskQueue,
} from '../packages/core/dist/index.js';
const service = new ProjectService({} as ProjectRepository, {} as TaskQueue);
it('健康检查依赖故障返回明确 503 且不泄漏凭据', async () => {
  const app = createApp(service, async () => {
    throw new Error('postgresql://secret-password@localhost');
  });
  const res = await app.request('/api/health');
  expect(res.status).toBe(503);
  const text = await res.text();
  expect(text).toContain('SERVICE_UNAVAILABLE');
  expect(text).not.toContain('secret-password');
});
it('非法项目 ID 和非法 JSON 返回 400', async () => {
  const app = createApp(service, async () => {});
  expect((await app.request('/api/projects/not-a-uuid')).status).toBe(400);
  expect(
    (await app.request('/api/projects', { method: 'POST', body: '{' })).status,
  ).toBe(400);
});
