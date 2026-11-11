import { describe, expect, it } from 'vitest';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { narrateFilm } from '../../packages/speech/src/film.js';
import { composeFilm } from '../../packages/renderer/src/film.js';
import { createApp } from '../../apps/api/src/app.js';
import type {
  ProjectService,
  ProductionService,
} from '../../packages/core/dist/index.js';
import type { Production } from '../../packages/contracts/src/production.js';
describe.skipIf(
  process.env.RUN_INTEGRATION !== '1' || process.platform !== 'darwin',
)('真实 sandbox 预览', () => {
  it('通过真实产物路由加载音频、播放并跳转，文本不变形', async () => {
    const root = await mkdtemp(join(tmpdir(), 'timo-preview-'));
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
    let server: ReturnType<typeof createServer> | undefined;
    try {
      const source: Production = {
        aspectRatio: '9:16',
        projectId: '11111111-1111-4111-8111-111111111111',
        revision: 1,
        stage: 'ready',
        brief: {
          topic: '测试',
          materials: '',
          durationSec: 15,
          language: 'zh',
          style: 'chalk',
          voiceProvider: 'local',
          voice: '',
        },
        scenes: [
          {
            id: 'p01',
            title: '小于 < 大于 >',
            visual: '变化',
            beats: ['种子', '萌芽'],
            cues: [{ id: 'c0', text: '这是一段真实配音，用来验证播放。' }],
          },
        ],
        artifacts: {},
        events: [],
      };
      const p = await composeFilm({
        production: await narrateFilm({ production: source, root }),
        root,
      });
      // Existing projects must receive the current player without another synthesis job.
      await writeFile(
        join(root, p.artifacts.preview!),
        '<html>legacy preview</html>',
      );
      const service = { get: async () => p } as unknown as ProductionService;
      const app = createApp({} as ProjectService, async () => {}, {
        service,
        root,
      });
      server = createServer(async (req, res) => {
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            `<iframe title="preview" sandbox="allow-scripts" allow="autoplay; fullscreen" allowfullscreen style="width:360px;height:640px" src="/api/projects/${p.projectId}/production/files/${p.artifacts.preview}"></iframe>`,
          );
          return;
        }
        const result = await app.fetch(
          new Request(`http://127.0.0.1${req.url}`, {
            headers: req.headers as Record<string, string>,
          }),
        );
        res.writeHead(result.status, Object.fromEntries(result.headers));
        res.end(Buffer.from(await result.arrayBuffer()));
      });
      await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
      const port = (server.address() as { port: number }).port;
      browser = await chromium.launch({ channel: 'chrome', headless: true });
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/`);
      const frame = page.frameLocator('iframe');
      await expect
        .poll(() =>
          frame
            .locator('audio')
            .evaluate((a: HTMLAudioElement) => a.readyState),
        )
        .toBeGreaterThanOrEqual(2);
      await expect
        .poll(() => frame.locator('h1').textContent())
        .toBe('小于 < 大于 >');
      await expect
        .poll(() =>
          frame.getByRole('button', { name: '开始播放', exact: true }).count(),
        )
        .toBe(1);
      await frame
        .getByRole('button', { name: '开始播放', exact: true })
        .click();
      await expect
        .poll(() =>
          frame
            .locator('audio')
            .evaluate((a: HTMLAudioElement) => a.currentTime),
        )
        .toBeGreaterThan(0);
      await expect
        .poll(() =>
          frame.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
        )
        .toBe(false);
      await frame.getByRole('button', { name: '暂停', exact: true }).click();
      await frame.locator('#seek').fill('300');
      await expect
        .poll(() =>
          frame
            .locator('audio')
            .evaluate((a: HTMLAudioElement) => a.currentTime),
        )
        .toBeCloseTo(0.3, 1);
      await frame.getByRole('button', { name: '静音', exact: true }).click();
      expect(
        await frame.locator('audio').evaluate((a: HTMLAudioElement) => a.muted),
      ).toBe(true);
      await frame
        .getByRole('combobox', { name: '播放速度' })
        .selectOption('1.5');
      expect(
        await frame
          .locator('audio')
          .evaluate((a: HTMLAudioElement) => a.playbackRate),
      ).toBe(1.5);
      await frame.locator('#stage').focus();
      await page.keyboard.press('Space');
      await expect
        .poll(() =>
          frame.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
        )
        .toBe(false);
      await page.keyboard.press('Space');
      await frame.locator('#seek').fill(String(p.durationMs));
      await frame
        .getByRole('button', { name: '重新播放', exact: true })
        .click();
      await expect
        .poll(() =>
          frame
            .locator('audio')
            .evaluate((a: HTMLAudioElement) => a.currentTime),
        )
        .toBeLessThan(1);
      await frame.getByRole('button', { name: '暂停', exact: true }).click();
      await frame.getByRole('button', { name: '全屏', exact: true }).click();
      await expect
        .poll(() =>
          frame.locator('body').evaluate(() => !!document.fullscreenElement),
        )
        .toBe(true);
      const fullCanvas = await frame.locator('#film-canvas').boundingBox();
      expect(fullCanvas!.width / fullCanvas!.height).toBeCloseTo(9 / 16, 2);
      await frame
        .getByRole('button', { name: '退出全屏', exact: true })
        .click();
      await expect
        .poll(() =>
          frame.locator('body').evaluate(() => !!document.fullscreenElement),
        )
        .toBe(false);
      expect(
        await frame
          .locator('body')
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    } finally {
      await browser?.close();
      server?.closeAllConnections();
      if (server) await new Promise<void>((r) => server!.close(() => r()));
      await rm(root, { recursive: true, force: true });
    }
  }, 60000);
});
