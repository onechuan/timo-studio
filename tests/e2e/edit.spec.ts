import { test, expect, type Route } from '@playwright/test';

const cues = [
  { id: 'c1', text: '第一句', startMs: 0, endMs: 1000 },
  { id: 'c2', text: '第二句', startMs: 1000, endMs: 2000 },
  { id: 'c3', text: '第三句', startMs: 2000, endMs: 3000 },
];
const project = {
  id: 'edit-e2e',
  title: '剪辑测试',
  kind: 'generated',
  aspectRatio: '16:9',
  status: 'draft',
};
const ready = {
  projectId: 'edit-e2e',
  revision: 2,
  aspectRatio: '16:9',
  stage: 'ready',
  brief: {
    topic: '剪辑测试',
    materials: '',
    narrationMode: 'ai',
    durationSec: 3,
    language: 'zh',
    style: 'warm',
    voiceProvider: 'local',
    voice: '',
  },
  durationMs: 3000,
  scenes: cues.map((cue, index) => ({
    id: `s${index + 1}`,
    title: `第${index + 1}段`,
    visual: '测试',
    beats: ['测试'],
    cues: [cue],
  })),
  artifacts: { audio: 'audio.wav', video: 'production/edit-e2e/r2/video.mp4' },
  events: [],
};

test('saves, reorders, mutes and exports an edit', async ({ page }, info) => {
  let doc: Record<string, unknown> = { ...ready };
  const puts: Record<string, unknown>[] = [];
  const actions: Record<string, unknown>[] = [];
  const json = (route: Route, body: unknown) => route.fulfill({ json: body });
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return json(route, {
        model: { configured: true, provider: 'test', model: 'test' },
        voices: { local: true, volcengine: false, elevenlabs: false },
      });
    if (path.endsWith('/production/actions')) {
      const body = route.request().postDataJSON();
      actions.push(body);
      doc = {
        ...doc,
        stage: 'rendering',
        jobId: 'edit-job',
        failedAction: undefined,
      };
      return json(route, doc);
    }
    if (path.includes('/production/files/'))
      return route.fulfill({ status: 404 });
    if (path.endsWith('/production')) {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON();
        puts.push(body);
        doc = {
          ...doc,
          revision: (doc.revision as number) + 1,
          edit: {
            source: {
              videoKey: ready.artifacts.video,
              durationMs: 3000,
              fps: 12,
              cues,
            },
            clips: body.edit.clips,
            subtitles: [],
          },
        };
      }
      return json(route, doc);
    }
    return json(route, project);
  });

  await page.goto('/#edit-e2e');
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('tab', { name: '剪辑', exact: true }).click();
  await expect(page.locator('.edit-clip')).toHaveCount(3);
  await expect(page.locator('.edit-subtitle')).toHaveText('第一句');

  await page
    .locator('.edit-clip-actions')
    .getByRole('button', { name: '删除' })
    .click();
  await expect(page.locator('.edit-clip')).toHaveCount(2);
  await page.getByLabel('静音本段').check();
  await page.getByRole('button', { name: '片段右移' }).click();

  await page.getByRole('button', { name: '保存剪辑' }).click();
  await expect.poll(() => puts.length).toBe(1);
  expect(puts[0]).toMatchObject({
    revision: 2,
    edit: {
      clips: [
        {
          id: 'clip-3',
          sourceInMs: 2000,
          sourceOutMs: 3000,
          volume: 1,
          muted: false,
        },
        {
          id: 'clip-2',
          sourceInMs: 1000,
          sourceOutMs: 2000,
          volume: 1,
          muted: true,
        },
      ],
    },
  });

  const exportButton = page.getByRole('button', { name: '导出剪辑 MP4' });
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
  await expect.poll(() => actions.length).toBe(1);
  expect(puts[1]).toMatchObject({ revision: 3 });
  expect(actions[0]).toEqual({ revision: 4, action: 'edit-export' });
});

test('offers a retry that resumes edit export after a failure', async ({
  page,
}) => {
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return route.fulfill({
        json: {
          model: { configured: true, provider: 'test', model: 'test' },
          voices: { local: true, volcengine: false, elevenlabs: false },
        },
      });
    if (path.endsWith('/production'))
      return route.fulfill({
        json: {
          ...ready,
          stage: 'failed',
          failedAction: 'edit-export',
          failure: {
            code: 'EDIT_EXPORT_FAILED',
            phase: 'rendering',
            retryable: true,
            publicMessage: '剪辑导出失败，可重试',
            diagnosticId: '11111111-1111-4111-8111-111111111111',
          },
          edit: {
            source: {
              videoKey: ready.artifacts.video,
              durationMs: 3000,
              fps: 12,
              cues,
            },
            clips: [
              {
                id: 'clip-1',
                sourceInMs: 0,
                sourceOutMs: 3000,
                timelineStartMs: 0,
                durationMs: 3000,
                volume: 1,
                muted: false,
              },
            ],
            subtitles: [],
          },
        },
      });
    return route.fulfill({ json: project });
  });
  await page.goto('/#edit-e2e');
  await expect(
    page.getByRole('button', { name: '重试剪辑导出' }),
  ).toBeVisible();
  await expect(page.getByText('剪辑导出失败，可重试')).toBeVisible();
});
