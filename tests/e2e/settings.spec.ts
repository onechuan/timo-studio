import { expect, test, type Page } from '@playwright/test';
const initial = () => ({
  revision: 0,
  model: {
    provider: 'deepseek',
    model: 'deepseek-flash',
    baseUrl: 'https://api.deepseek.com',
    protocol: 'openai',
    apiKeyConfigured: true,
  },
  speech: {
    volcengine: {
      apiKeyConfigured: true,
      voice: 'zh_male_yuanboxiaoshu_uranus_bigtts',
      resourceId: '',
    },
    elevenlabs: { apiKeyConfigured: false, voice: '' },
  },
});
async function settingsRoutes(page: Page, fail = false) {
  let state = initial();
  const patches: any[] = [];
  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'PUT') {
      const patch = route.request().postDataJSON();
      patches.push(patch);
      if (fail)
        return route.fulfill({
          status: 503,
          json: { error: { message: '保存暂时不可用' } },
        });
      state = {
        revision: state.revision + 1,
        model: {
          ...state.model,
          ...patch.model,
          apiKeyConfigured:
            patch.model?.apiKey === null
              ? false
              : state.model.apiKeyConfigured || !!patch.model?.apiKey,
        },
        speech: {
          volcengine: {
            ...state.speech.volcengine,
            ...patch.speech?.volcengine,
          },
          elevenlabs: {
            ...state.speech.elevenlabs,
            ...patch.speech?.elevenlabs,
          },
        },
      };
      delete (state.model as any).apiKey;
      delete (state.speech.volcengine as any).apiKey;
      delete (state.speech.elevenlabs as any).apiKey;
    }
    return route.fulfill({ json: state });
  });
  await page.route('**/api/projects', (route) => route.fulfill({ json: [] }));
  return patches;
}
test('配置页保存 API 与 Key，刷新只显示配置状态，留空保留 Key', async ({
  page,
}) => {
  const patches = await settingsRoutes(page);
  await page.goto('/');
  await page.getByRole('link', { name: '服务配置', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '服务配置', exact: true }),
  ).toBeVisible();
  const key = page.getByLabel('模型 API Key', { exact: true });
  await expect(key).toHaveValue('');
  await page
    .getByLabel('模型 API 地址', { exact: true })
    .fill('https://gateway.example/v1');
  await key.fill('test-only-model-key');
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('配置已保存');
  await expect(key).toHaveValue('');
  expect(patches[0].model.apiKey).toBe('test-only-model-key');
  await page.reload();
  await expect(key).toHaveValue('');
  await expect(page.getByLabel('模型 API 地址', { exact: true })).toHaveValue(
    'https://gateway.example/v1',
  );
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect.poll(() => patches.length).toBe(2);
  expect(patches[1].model.apiKey).toBeUndefined();
  expect(
    await page
      .locator('body')
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});
test('火山音色可按名称搜索选择、试听与保存自定义 ID', async ({ page }) => {
  const patches = await settingsRoutes(page);
  const requested: any[] = [];
  await page.route('**/api/settings/voices/preview', (route) => {
    requested.push(route.request().postDataJSON());
    // A tiny real PCM WAV keeps the browser audio control usable without paid synthesis.
    const wav = Buffer.alloc(44 + 4800);
    wav.write('RIFF');
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(24000, 24);
    wav.writeUInt32LE(48000, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write('data', 36);
    wav.writeUInt32LE(4800, 40);
    return route.fulfill({ contentType: 'audio/wav', body: wav });
  });
  await page.goto('/#settings');
  await page.getByRole('tab', { name: '配音服务', exact: true }).click();
  await page.getByRole('button', { name: '选择火山音色', exact: true }).click();
  await page.getByLabel('搜索火山音色', { exact: true }).fill('Vivi');
  await page
    .getByRole('button', { name: '选择音色：Vivi 2.0', exact: true })
    .click();
  await expect(
    page.getByText('zh_female_vv_uranus_bigtts', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: '试听音色', exact: true }).click();
  await expect.poll(() => requested.length).toBe(1);
  expect(requested[0].voice).toBe('zh_female_vv_uranus_bigtts');
  const player = page.locator('.voice-picker audio');
  await expect(player).not.toHaveAttribute('controls');
  await expect(page.getByLabel('试听播放进度')).toBeVisible();
  await expect(
    page.getByRole('button', { name: '播放试听', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '播放试听', exact: true }).click();
  await expect
    .poll(() => player.evaluate((el: HTMLAudioElement) => el.ended))
    .toBe(true);
  expect(requested).toHaveLength(1);
  const selection = await page
    .getByRole('button', { name: '选择火山音色', exact: true })
    .boundingBox();
  const preview = await page.locator('.voice-audition').boundingBox();
  expect(preview!.x).toBeGreaterThanOrEqual(selection!.x + selection!.width);

  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('配置已保存');
  expect(patches[0].speech.volcengine.voice).toBe('zh_female_vv_uranus_bigtts');
  await page.getByText('自定义音色 ID', { exact: true }).click();
  await page
    .getByLabel('自定义火山音色 ID', { exact: true })
    .fill('S_my_voice');
  await expect(player).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '试听音色', exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect.poll(() => patches.length).toBe(2);
  expect(patches[1].speech.volcengine.voice).toBe('S_my_voice');
  await page.screenshot({
    path: 'test-results/settings-voices-' + test.info().project.name + '.png',
    fullPage: true,
  });
});
test('配置保存失败保留输入；项目入口能选择火山音色', async ({ page }) => {
  await settingsRoutes(page, true);
  await page.goto('/#settings');
  await page
    .getByLabel('模型 API Key', { exact: true })
    .fill('test-key-still-editable');
  await page.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('保存暂时不可用');
  await expect(page.getByLabel('模型 API Key', { exact: true })).toHaveValue(
    'test-key-still-editable',
  );
  await page.goto('/');
  await page
    .locator('.production-fields > details > summary')
    .filter({ hasText: '创作设置' })
    .click();
  await page.getByRole('button', { name: '选择火山音色', exact: true }).click();
  await page.getByLabel('搜索火山音色', { exact: true }).fill('云舟');
  await page
    .getByRole('button', { name: '选择音色：云舟 2.0', exact: true })
    .click();
  await expect(
    page.getByText('zh_male_m191_uranus_bigtts', { exact: true }).first(),
  ).toBeVisible();
});
