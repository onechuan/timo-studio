import { test, expect, type Page } from '@playwright/test';
const brief = {
  topic: '测试',
  materials: '',
  durationSec: 60,
  language: 'zh',
  style: 'warm',
  voiceProvider: 'local',
  voice: '',
};
const scene = {
  id: 's',
  title: '测试',
  visual: '圆',
  beats: ['出现'],
  cues: [{ id: 'c', text: '测试口播' }],
};
function document(stage = 'ready') {
  return {
    projectId: 'recovery',
    revision: 1,
    aspectRatio: '9:16',
    stage,
    brief,
    scenes: [scene],
    artifacts: {},
    events: [],
  };
}
async function setup(page: Page) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return route.fulfill({
        json: { model: { configured: true }, voices: { local: true } },
      });
    if (path.endsWith('/timeline'))
      return route.fulfill({
        json: {
          revision: 0,
          fps: 30,
          videoClips: [],
          audioClips: [],
          subtitles: [],
        },
      });
    return route.fulfill({
      json: {
        id: 'recovery',
        title: '测试项目',
        kind: 'explain',
        aspectRatio: '9:16',
      },
    });
  });
}
test('poll retries after a transient network failure', async ({ page }) => {
  await setup(page);
  let reads = 0;
  let polling = false;
  let failed = false;
  await page.route('**/api/projects/recovery/production', (route) => {
    reads++;
    if (polling && !failed) {
      failed = true;
      return route.abort();
    }
    return route.fulfill({
      json: {
        ...document(failed ? 'ready' : 'narrating'),
        jobId: failed ? undefined : 'j',
      },
    });
  });
  await page.goto('/#recovery');
  await expect(page.getByText('正在配音 · 修订 1')).toBeVisible();
  polling = true;
  await expect(page.getByText('预览已就绪 · 修订 1')).toBeVisible({
    timeout: 10000,
  });
  expect(reads).toBeGreaterThanOrEqual(3);
});
test('successful script save followed by failed submit uses latest revision on retry', async ({
  page,
}, info) => {
  await setup(page);
  let doc = document();
  const revisions: number[] = [];
  await page.route('**/api/projects/recovery/production', (route) => {
    if (route.request().method() === 'PUT') {
      revisions.push(route.request().postDataJSON().revision);
      doc = { ...doc, revision: doc.revision + 1 };
    }
    return route.fulfill({ json: doc });
  });
  await page.route('**/api/projects/recovery/production/actions', (route) =>
    route.fulfill({ status: 503, json: { error: { message: '暂时不可用' } } }),
  );
  await page.goto('/#recovery');
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('tab', { name: '口播', exact: true }).click();
  await page.getByRole('button', { name: '保存口播并重新配音' }).click();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '导演流程', exact: true }).click();
  await expect(page.getByText('预览已就绪 · 修订 2')).toBeVisible();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('button', { name: '保存口播并重新配音' }).click();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '导演流程', exact: true }).click();
  await expect(page.getByText('预览已就绪 · 修订 3')).toBeVisible();
  expect(revisions).toEqual([1, 2]);
});
for (const action of ['plan', 'export'])
  test(`failed ${action} retries original action`, async ({ page }) => {
    await setup(page);
    let requested = '';
    await page.route('**/api/projects/recovery/production', (route) =>
      route.fulfill({ json: { ...document('failed'), failedAction: action } }),
    );
    await page.route('**/api/projects/recovery/production/actions', (route) => {
      requested = route.request().postDataJSON().action;
      return route.fulfill({ json: { ...document(), jobId: 'j' } });
    });
    await page.goto('/#recovery');
    await page.getByRole('button', { name: '重试制作' }).click();
    await expect.poll(() => requested).toBe(action);
  });

test('initial load recovers automatically while the API restarts', async ({
  page,
}) => {
  await setup(page);
  let reads = 0;
  await page.route('**/api/projects/recovery/production', (route) => {
    reads++;
    return reads < 3
      ? route.fulfill({ status: 500, body: '' })
      : route.fulfill({ json: document() });
  });
  await page.goto('/#recovery');
  await expect(page.getByText('预览已就绪 · 修订 1')).toBeVisible();
  await expect(page.getByText('请求失败 (500)', { exact: true })).toHaveCount(
    0,
  );
  // React StrictMode also starts a second initial read in development.
  expect(reads).toBeGreaterThanOrEqual(3);
});
test('initial load failure is visible and can be retried', async ({ page }) => {
  await setup(page);
  let unavailable = true;
  await page.route('**/api/projects/recovery/production', (route) =>
    unavailable
      ? route.fulfill({
          status: 503,
          json: { error: { message: '制作服务暂时不可用' } },
        })
      : route.fulfill({ json: document() }),
  );
  await page.goto('/#recovery');
  await expect(page.getByRole('alert')).toContainText('制作服务暂时不可用');
  unavailable = false;
  await page
    .getByRole('button', { name: '重新加载工作台', exact: true })
    .click();
  await expect(page.getByText('预览已就绪 · 修订 1')).toBeVisible();
});

test('绘图失败展示页码和字段详情，制作记录保留诊断', async ({ page }) => {
  await setup(page);
  const message =
    '第 2 页绘图格式校验失败（已尝试 2 次），请重试绘图。\n1. artwork.elements[0].width：字段类型不正确';
  await page.route('**/api/projects/recovery/production', (route) =>
    route.fulfill({
      json: {
        ...document('failed'),
        error: message,
        failedAction: 'produce',
        events: [{ at: '2026-11-08T15:54:00Z', message }],
      },
    }),
  );
  await page.goto('/#recovery');
  const alert = page.getByRole('alert').first();
  await expect(alert).toContainText('第 2 页');
  await expect(alert).toContainText('artwork.elements[0].width');
  await expect(alert).toHaveCSS('white-space', 'pre-line');
  await page.locator('.production-log > summary').click();
  await expect(page.locator('.production-log p')).toHaveText(message);
  await expect(
    page.getByRole('button', { name: '重试制作', exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => window.document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const status of ['failed', 'needs-input']) {
  test(`duration ${status} offers explicit acceptance without restarting production`, async ({
    page,
  }) => {
    await setup(page);
    const doc = {
      ...document('failed'),
      revision: 7,
      brief: { ...brief, topic: '用一分钟认识咖啡', durationSec: 300 },
      scenes: [
        {
          ...scene,
          cues: [{ id: 'c', text: '咖啡', startMs: 0, endMs: 174792 }],
        },
      ],
      durationMs: 174792,
      durationState: {
        status,
        targetMs: 300000,
        minMs: 270000,
        maxMs: 330000,
        measuredMs: 174792,
        correctionRound: 2,
      },
      artifacts: { audio: 'audio.wav', subtitles: 'subtitles.srt' },
      failure: {
        code: 'DURATION_CONTENT_INSUFFICIENT',
        phase: 'narrating',
        retryable: false,
        diagnosticId: 'duration',
        publicMessage: '自动校正 2 轮后，真实配音仍为 175 秒',
      },
    };
    await page.route('**/api/projects/recovery/production', (route) =>
      route.fulfill({ json: doc }),
    );
    let action = '';
    await page.route('**/api/projects/recovery/production/actions', (route) => {
      action = route.request().postDataJSON().action;
      return route.fulfill({
        json: {
          ...doc,
          stage: 'illustrating',
          jobId: 'job',
          failure: undefined,
          durationState: { ...doc.durationState, status: 'accepted' },
        },
      });
    });
    await page.goto('/products/new#recovery');
    await expect(page.getByText('等待确认时长 · 修订 7')).toBeVisible();
    await page
      .getByRole('button', { name: '修改目标时长', exact: true })
      .click();
    await expect(
      page.getByText('主题中的时长与目标时长不同，将以目标时长 300 秒为准。'),
    ).toBeVisible();
    await page
      .getByRole('button', { name: '按 175 秒继续制作', exact: true })
      .click();
    await expect.poll(() => action).toBe('accept-duration');
  });
}
