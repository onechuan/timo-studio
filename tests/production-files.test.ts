import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '../apps/api/src/app.js';
import type { ProjectService } from '../packages/core/dist/index.js';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ProductionService } from '../packages/core/dist/index.js';
const id = '11111111-1111-4111-8111-111111111111';
const key = `production/${id}/r1/audio.wav`;
let root: string;
let app: ReturnType<typeof createApp>;
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'timo-files-'));
  await mkdir(join(root, `production/${id}/r1`), { recursive: true });
  await writeFile(join(root, key), Buffer.from('0123456789'));
  const service = {
    get: async () => ({ projectId: id, artifacts: { audio: key }, scenes: [] }),
  } as unknown as ProductionService;
  app = createApp({} as ProjectService, async () => {}, { service, root });
});
afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});
it('产物文件支持音频 seek 和后缀范围', async () => {
  const url = `/api/projects/${id}/production/files/${key}`;
  const full = await app.request(url);
  expect(full.status).toBe(200);
  expect(await full.text()).toBe('0123456789');
  const part = await app.request(url, { headers: { range: 'bytes=2-4' } });
  expect(part.status).toBe(206);
  expect(await part.text()).toBe('234');
  const suffix = await app.request(url, { headers: { range: 'bytes=-2' } });
  expect(await suffix.text()).toBe('89');
  expect(
    (await app.request(url, { headers: { range: 'bytes=100-200' } })).status,
  ).toBe(416);
});
it('只允许当前项目登记的产物，不读取任意文件', async () => {
  expect(
    (await app.request(`/api/projects/${id}/production/files/.env`)).status,
  ).toBe(404);
  expect(
    (
      await app.request(
        `/api/projects/${id}/production/files/production/other/r1/audio.wav`,
      )
    ).status,
  ).toBe(404);
});
it('serves edited video and subtitles and denies unregistered siblings', async () => {
  const videoKey = `production/${id}/r1/edit.mp4`;
  const subtitlesKey = `production/${id}/r1/edit.srt`;
  await Promise.all([
    writeFile(join(root, videoKey), Buffer.from('edited-video')),
    writeFile(
      join(root, subtitlesKey),
      Buffer.from('1\n00:00:00,000 --> 00:00:01,000\n字幕\n'),
    ),
  ]);
  const service = {
    get: async () => ({
      projectId: id,
      artifacts: {},
      scenes: [],
      edit: {
        output: {
          videoKey,
          subtitlesKey,
          durationMs: 1000,
          exportedAt: '2026-11-13T00:00:00.000Z',
        },
      },
    }),
  } as unknown as ProductionService;
  const edited = createApp({} as ProjectService, async () => {}, {
    service,
    root,
  });
  const video = await edited.request(
    `/api/projects/${id}/production/files/${videoKey}`,
  );
  expect(video.status).toBe(200);
  expect(video.headers.get('content-type')).toBe('video/mp4');
  const range = await edited.request(
    `/api/projects/${id}/production/files/${videoKey}`,
    { headers: { range: 'bytes=7-11' } },
  );
  expect(range.status).toBe(206);
  expect(await range.text()).toBe('video');
  const subtitles = await edited.request(
    `/api/projects/${id}/production/files/${subtitlesKey}`,
  );
  expect(subtitles.headers.get('content-type')).toContain('x-subrip');
  expect(
    (
      await edited.request(
        `/api/projects/${id}/production/files/production/${id}/r1/other.mp4`,
      )
    ).status,
  ).toBe(404);
});
it('serves registered review frames as images and denies unregistered siblings', async () => {
  const frameKey = `production/${id}/r1/frame.png`;
  await writeFile(join(root, frameKey), Buffer.from('png-fixture'));
  const service = {
    get: async () => ({
      projectId: id,
      artifacts: {},
      scenes: [
        { cues: [], review: { frames: [{ key: frameKey, timeMs: 0 }] } },
      ],
    }),
  } as unknown as ProductionService;
  const reviewed = createApp({} as ProjectService, async () => {}, {
    service,
    root,
  });
  const response = await reviewed.request(
    `/api/projects/${id}/production/files/${frameKey}`,
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('image/png');
  expect(
    (
      await reviewed.request(
        `/api/projects/${id}/production/files/production/${id}/r1/other.png`,
      )
    ).status,
  ).toBe(404);
});
