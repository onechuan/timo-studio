import { test, expect } from '@playwright/test';
test('首页示例与折叠创作字段可用', async ({ page }) => {
  await page.route('**/api/projects', (r) => r.fulfill({ json: [] }));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: '让想法，成为画面。' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '为什么天空是蓝色的' }).click();
  await expect(page.getByLabel('你想讲什么？')).toHaveValue(
    '为什么天空是蓝色的',
  );
  await page.getByText('添加资料', { exact: true }).click();
  await page.getByLabel('资料内容').fill('光的散射');
  await page.getByText('创作设置', { exact: false }).click();
  await page.getByRole('combobox', { name: '目标时长', exact: true }).click();
  await page.getByRole('option', { name: '90秒', exact: true }).click();
  await expect(
    page.getByRole('combobox', { name: '目标时长', exact: true }),
  ).toHaveText('90秒');
  await page.getByText('项目选项', { exact: false }).click();
  await expect(page.getByLabel('创作类型')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test('深色下拉支持时长预设、键盘选择及关闭', async ({ page }) => {
  await page.route('**/api/projects', (r) => r.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByText('创作设置', { exact: false }).click();
  const duration = page.getByRole('combobox', {
    name: '目标时长',
    exact: true,
  });
  await expect(duration).toHaveText('1分钟');
  await duration.click();
  await expect(page.getByRole('listbox').getByRole('option')).toHaveText([
    '30秒',
    '50秒',
    '1分钟',
    '90秒',
    '2分钟',
    '3分钟',
    '5分钟',
    '10分钟',
  ]);
  for (const label of [
    '30秒',
    '50秒',
    '1分钟',
    '90秒',
    '2分钟',
    '3分钟',
    '5分钟',
    '10分钟',
  ]) {
    if ((await duration.getAttribute('aria-expanded')) === 'false')
      await duration.click();
    await page.getByRole('option', { name: label, exact: true }).click();
    await expect(duration).toHaveText(label);
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(
      page
        .locator('.production-fields summary')
        .filter({ hasText: '创作设置' }),
    ).toContainText(label);
  }
  await duration.press('Enter');
  await duration.press('Home');
  await duration.press('ArrowDown');
  await duration.press('Enter');
  await expect(duration).toHaveText('50秒');
  await expect(duration).toBeFocused();
  await duration.press('Enter');
  await duration.press('End');
  await duration.press('Escape');
  await expect(duration).toHaveText('50秒');
  await expect(duration).toHaveAttribute('aria-expanded', 'false');
  await duration.click();
  await page.getByLabel('你想讲什么？').click();
  await expect(duration).toHaveAttribute('aria-expanded', 'false');
  await duration.focus();
  await duration.press('Enter');
  await duration.press('Tab');
  await expect(duration).toHaveAttribute('aria-expanded', 'false');
  for (const [label, option] of [
    ['创作方向', '产品介绍'],
    ['语言', 'English'],
    ['画面风格', '科技'],
    ['配音服务', 'macOS 系统语音'],
  ]) {
    const field = page.getByRole('combobox', { name: label, exact: true });
    await field.click();
    await page.getByRole('option', { name: option, exact: true }).click();
    await expect(field).toHaveText(option);
  }
  await duration.click();
  const bounds = await page.getByRole('listbox').boundingBox();
  const viewport = page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
});
