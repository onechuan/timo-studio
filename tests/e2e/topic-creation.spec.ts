import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
test('创作方向从首页保存，工作台修改后刷新恢复', async ({ page, request }) => {
  await page.goto('/');
  const topic = '创作方向验证 ' + randomUUID().slice(0, 8);
  await page.getByLabel('你想讲什么？').fill(topic);
  await page.locator('summary').filter({ hasText: '创作设置' }).click();
  await expect(
    page.getByRole('combobox', { name: '创作方向', exact: true }),
  ).toHaveText('通用讲解');
  await page.getByRole('combobox', { name: '创作方向', exact: true }).click();
  await page.getByRole('option', { name: '科普口播', exact: true }).click();
  await page.getByRole('combobox', { name: '目标时长', exact: true }).click();
  await page.getByRole('option', { name: '10分钟', exact: true }).click();
  await page.getByRole('button', { name: '创建项目', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: topic, exact: true }),
  ).toBeVisible();
  const id = await page.evaluate(() => location.hash.slice(1));
  try {
    await expect
      .poll(
        async () =>
          (await (await request.get(`/api/projects/${id}/production`)).json())
            .brief?.contentType,
      )
      .toBe('explainer');
    expect(
      (await (await request.get(`/api/projects/${id}/production`)).json()).brief
        .durationSec,
    ).toBe(600);
    await page.reload();
    await page.locator('summary').filter({ hasText: '创作设置' }).click();
    await expect(
      page.getByRole('combobox', { name: '目标时长', exact: true }),
    ).toHaveText('10分钟');
    await expect(
      page.getByRole('combobox', { name: '创作方向', exact: true }),
    ).toHaveText('科普口播');
    await page.getByRole('combobox', { name: '创作方向', exact: true }).click();
    await page.getByRole('option', { name: '产品介绍', exact: true }).click();
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith(`/api/projects/${id}/production`) &&
        r.request().method() === 'PUT',
    );
    await page
      .getByRole('button', { name: '保存主题与资料', exact: true })
      .click();
    expect((await saved).ok()).toBe(true);
    await page.reload();
    await page.locator('summary').filter({ hasText: '创作设置' }).click();
    await expect(
      page.getByRole('combobox', { name: '创作方向', exact: true }),
    ).toHaveText('产品介绍');
    expect(
      await page
        .locator('body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/content-direction-${test.info().project.name}.png`,
      fullPage: true,
    });
  } finally {
    const { PrismaClient } = await import('../../packages/db/src/index.js');
    const db = new PrismaClient();
    await db.project.delete({ where: { id } });
    await db.$disconnect();
  }
});
test('仅输入主题即可建立项目，刷新后恢复；无模型配置明确提示', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const topic = '解释复利 ' + randomUUID().slice(0, 8);
  await page.getByLabel('你想讲什么？').fill(topic);
  await expect(page.getByRole('button', { name: '创建项目' })).toBeEnabled();
  await page.getByRole('button', { name: '创建项目' }).click();
  await expect(
    page.getByRole('heading', { name: topic, exact: true }),
  ).toBeVisible();
  const id = await page.evaluate(() => location.hash.slice(1));
  try {
    await expect(page.getByLabel('你想讲什么？')).toHaveValue(topic);
    const caps = await (
      await request.get('/api/production/capabilities')
    ).json();
    if (!caps.model.configured) {
      await expect(
        page.getByText('尚未配置导演模型。', { exact: false }),
      ).toBeVisible();
      await page.getByRole('button', { name: '规划分镜', exact: true }).click();
      await expect(page.getByRole('alert')).toContainText('尚未配置导演模型');
    }
    await page.reload();
    await expect(page.getByLabel('你想讲什么？')).toHaveValue(topic);
    expect(
      await page
        .locator('body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: 'test-results/topic-workspace-' + test.info().project.name + '.png',
      fullPage: true,
    });
  } finally {
    const { PrismaClient } = await import('../../packages/db/src/index.js');
    const db = new PrismaClient();
    await db.project.delete({ where: { id } });
    await db.$disconnect();
  }
});
