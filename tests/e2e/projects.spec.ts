import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
test('创建、顶部重命名、取消和刷新持久化', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: '让想法，成为画面。' }),
  ).toBeVisible();
  const title = '浏览器验证 ' + randomUUID();
  await page.locator('.project-options > summary').click();
  await page.getByLabel('创作类型').selectOption('edited');
  await page.getByLabel('项目名称', { exact: true }).fill(title);
  await page.getByRole('button', { name: '创建项目' }).click();
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
  const projectId = await page.evaluate(() => location.hash.slice(1));
  try {
    await expect(page.getByText('项目设置与诊断', { exact: true })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: '运行诊断' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '保存时间轴' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('link', { name: '服务配置' })).toBeVisible();
    await page.getByRole('button', { name: '重命名项目' }).click();
    await page.getByLabel('项目名称', { exact: true }).fill('取消的修改');
    await page.getByRole('button', { name: '取消重命名' }).click();
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: '重命名项目' }).click();
    await expect(page.getByLabel('项目名称', { exact: true })).toHaveValue(
      title,
    );
    await page.getByLabel('项目名称', { exact: true }).fill('   ');
    await expect(page.getByRole('button', { name: '保存标题' })).toBeDisabled();
    await page.getByLabel('项目名称', { exact: true }).fill(title + ' 已修改');
    await page.route(
      '**/api/projects/' + projectId,
      (route) =>
        route.fulfill({
          status: 503,
          json: { error: { code: 'UNAVAILABLE', message: '保存失败，请重试' } },
        }),
      { times: 1 },
    );
    await page.getByRole('button', { name: '保存标题' }).click();
    await expect(page.getByRole('alert')).toContainText('保存失败，请重试');
    await expect(page.getByLabel('项目名称', { exact: true })).toHaveValue(
      title + ' 已修改',
    );
    await page.getByRole('button', { name: '保存标题' }).click();
    await expect(page.getByRole('status')).toContainText('项目标题已保存');
    await page.reload();
    await expect(
      page.getByRole('heading', { name: title + ' 已修改', exact: true }),
    ).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty(
      'scrollWidth',
      await page.evaluate(() => document.body.clientWidth),
    );
    await page.screenshot({
      path: 'test-results/workspace-' + test.info().project.name + '.png',
      fullPage: true,
    });
    await page
      .locator('.workspace-titlebar')
      .getByRole('link', { name: '我的项目', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: title + ' 已修改', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('link')
      .filter({
        has: page.getByRole('heading', {
          name: title + ' 已修改',
          exact: true,
        }),
      })
      .click();
    await expect(
      page.getByRole('heading', { name: title + ' 已修改', exact: true }),
    ).toBeVisible();
  } finally {
    const { PrismaClient } = await import('../../packages/db/src/index.js');
    const db = new PrismaClient();
    await db.project.delete({ where: { id: projectId } });
    await db.$disconnect();
  }
});
