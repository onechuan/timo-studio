import { test, expect } from '@playwright/test';

// Opt-in, read-only smoke test against an already generated local project.
const projectId = process.env.TIMO_LIVE_PROJECT_ID;
test.skip(
  !projectId,
  'Set TIMO_LIVE_PROJECT_ID to inspect a generated preview',
);
test('saved production loads every scene and plays its existing audio', async ({
  page,
  request,
}, info) => {
  const response = await request.get(`/api/projects/${projectId}/production`);
  expect(response.ok()).toBe(true);
  const doc = await response.json();
  expect(doc.stage).toBe('ready');
  expect(doc.jobId).toBeFalsy();
  expect(doc.artifacts.preview).toBeTruthy();
  expect(doc.scenes.every((scene: any) => scene.artwork?.elements.length)).toBe(
    true,
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/#${projectId}`);
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible();
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('#visual > svg')).toBeVisible();
  const handle = await iframe.elementHandle();
  const preview = await handle!.contentFrame();
  for (const scene of doc.scenes) {
    const time = (scene.cues[0].startMs + scene.cues.at(-1).endMs) / 2;
    await preview!.evaluate((t) => (window as any).renderAt(t), time);
    await expect(frame.locator('#title')).toHaveText(scene.title);
    await expect(frame.locator('#visual > svg')).toBeVisible();
  }
  await preview!.evaluate(() => {
    document.querySelector('audio')!.muted = true;
    (window as any).renderAt(0);
  });
  await frame.getByRole('button', { name: '开始播放', exact: true }).click();
  await expect
    .poll(() =>
      preview!.evaluate(() => document.querySelector('audio')!.currentTime),
    )
    .toBeGreaterThan(0.5);
  await frame.getByRole('button', { name: '暂停', exact: true }).click();
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `.data/live-preview-${info.project.name}.png`,
    fullPage: true,
  });
});
