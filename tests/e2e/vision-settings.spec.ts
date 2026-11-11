import { test, expect } from '@playwright/test';
test('独立视觉配置保存与手动图片检查', async ({ page }) => {
  let state: any = {
    revision: 0,
    model: {
      provider: 'director',
      model: 'text',
      baseUrl: '',
      protocol: 'openai',
      apiKeyConfigured: true,
    },
    speech: {
      volcengine: { apiKeyConfigured: false, voice: '', resourceId: '' },
      elevenlabs: { apiKeyConfigured: false, voice: '' },
    },
  };
  const patches: any[] = [];
  let probes = 0;
  await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/settings', (route) => {
    if (route.request().method() === 'PUT') {
      const patch = route.request().postDataJSON();
      patches.push(patch);
      state = {
        ...state,
        revision: state.revision + 1,
        reviewer: {
          ...patch.reviewer,
          apiKeyConfigured: !!patch.reviewer.apiKey,
        },
      };
      delete state.reviewer.apiKey;
    }
    return route.fulfill({ json: state });
  });
  await page.route('**/api/settings/reviewer/probe', (route) => {
    probes++;
    return route.fulfill({
      json: {
        accepted: true,
        message: '图片请求已被接受；这不代表审片判断准确。',
      },
    });
  });
  await page.goto('/#settings');
  await page.getByRole('tab', { name: '视觉审片模型' }).click();
  await expect(
    page.getByRole('button', { name: '检查图片输入' }),
  ).toBeDisabled();
  await page.getByLabel('启用视觉审片').check();
  await page.getByLabel('视觉模型 ID', { exact: true }).fill('vision-model');
  await page
    .getByLabel('视觉审片 API Key', { exact: true })
    .fill('test-only-vision-key');
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('配置已保存');
  expect(patches[0].model.model).toBe('text');
  expect(patches[0].model.apiKey).toBeUndefined();
  expect(patches[0].reviewer.apiKey).toBe('test-only-vision-key');
  expect(probes).toBe(0);
  await page.getByRole('button', { name: '检查图片输入' }).click();
  await expect(page.getByRole('status')).toContainText('图片请求已被接受');
  expect(probes).toBe(1);
  await page.reload();
  await page.getByRole('tab', { name: '视觉审片模型' }).click();
  await expect(
    page.getByLabel('视觉审片 API Key', { exact: true }),
  ).toHaveValue('');
  await expect(page.getByLabel('视觉模型 ID', { exact: true })).toHaveValue(
    'vision-model',
  );
  expect(
    await page
      .locator('body')
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});
