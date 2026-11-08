import { test, expect } from '@playwright/test';
test('创建、打开、改名、保存时间轴、诊断和刷新', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: '让想法，成为画面。' }),
  ).toBeVisible();
  const title = '浏览器验证 ' + Date.now();
  await page.getByLabel('项目名称').fill(title);
  await page.getByRole('button', { name: '创建项目' }).click();
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
  const projectId = await page.evaluate(() => location.hash.slice(1));
  try {
    await page.getByLabel('项目名称').fill(title + ' 已修改');
    await page.getByRole('button', { name: '保存标题' }).click();
    await expect(page.getByRole('status')).toContainText('项目标题已保存');
    await page.getByRole('button', { name: '保存时间轴' }).click();
    await expect(page.getByRole('status')).toContainText('时间轴已保存');
    await page.getByRole('button', { name: '运行诊断' }).click();
    await expect(page.getByText('诊断成功 · 100%')).toBeVisible({
      timeout: 20000,
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: title + ' 已修改', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('r1', { exact: true })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty(
      'scrollWidth',
      await page.evaluate(() => document.body.clientWidth),
    );
    await page.screenshot({
      path: 'test-results/workspace-' + test.info().project.name + '.png',
      fullPage: true,
    });
    await page.getByRole('link', { name: '← 我的项目' }).click();
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
