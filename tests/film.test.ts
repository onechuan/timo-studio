import { createRequire } from 'node:module';
import { it, expect } from 'vitest';
import { toSrt, voiceCacheKey } from '../packages/speech/src/film.js';
import { escapeHtml, locateCue } from '../packages/renderer/src/film.js';
it('formats measured cue timing and deterministic voice cache', () => {
  expect(
    toSrt([{ id: 'a', text: '你好', startMs: 1020, endMs: 2400 }]),
  ).toContain('00:00:01,020 --> 00:00:02,400');
  expect(voiceCacheKey('a', 'local', 'Tingting')).not.toBe(
    voiceCacheKey('b', 'local', 'Tingting'),
  );
});
it('escapes template text and locates half-open cues', () => {
  expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  expect(locateCue([{ startMs: 0, endMs: 100 }], 100)).toBe(-1);
});
import { mkdtemp, stat, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { narrateFilm } from '../packages/speech/src/film.js';
import { renderFilm, filmHtml } from '../packages/renderer/src/film.js';
import { hashProgramSource } from '../packages/renderer/src/program.js';
import type { Production } from '../packages/contracts/src/production.js';
it('导出使用无播放器与音频请求的确定性模板', () => {
  const p = {
    aspectRatio: '16:9',
    brief: { style: 'warm', language: 'zh' },
    durationMs: 1000,
    scenes: [
      {
        id: 's',
        title: '</script><script>bad()</script>',
        beats: ['种子'],
        cues: [{ text: '<b>字幕</b>', startMs: 0, endMs: 1000 }],
      },
    ],
  } as unknown as Production;
  const exported = filmHtml(p, { controls: false });
  expect(exported).toContain('window.renderAt');
  expect(exported).not.toContain('player-controls');
  expect(exported).not.toContain('<audio');
  expect(exported).not.toContain('requestAnimationFrame');
  expect(exported).not.toContain('<script>bad()');
  expect(filmHtml(p)).toContain('player-controls');
});
it('将 V3 绘图程序封装为无外链的安全预览', () => {
  const source =
    "TIMO.visual('s', P => { P.title('第一性原理', { accent: 'yellow' }); P.ring(960, 540, 300, 300, { at: P.c(0), color: 'yellow' }); P.text('拆开假设', { x: 760, y: 480, size: 72, at: P.c(1) }); });";
  const p = {
    aspectRatio: '16:9',
    brief: { style: 'warm', language: 'zh' },
    durationMs: 2000,
    scenes: [
      {
        id: 's',
        title: '第一性原理',
        visual: '拆解假设',
        beats: ['拆解', '重构'],
        cues: [
          { id: 'q1', text: '先拆开假设。', startMs: 0, endMs: 1000 },
          { id: 'q2', text: '再从事实重构。', startMs: 1000, endMs: 2000 },
        ],
        artwork: {
          version: 3,
          runtime: 'timotv-dsl-1',
          intent: '用黄色圆形表达核心事实',
          source,
          sourceHash: hashProgramSource(source),
          style: 'chalkboard',
          extras: [],
        },
      },
    ],
  } as unknown as Production;
  const html = filmHtml(p, { controls: false });
  expect(html).toContain("default-src 'none'");
  expect(html).toContain('window.renderAt');
  expect(html).toContain('TIMO.visual');
  expect(html).toContain('id="viewport"');
  expect(html).not.toMatch(/<(?:script|link)[^>]+(?:src|href)=/);
  expect(html).not.toContain('player-controls');
  expect(() =>
    filmHtml({
      ...p,
      scenes: [
        {
          ...p.scenes[0]!,
          artwork: {
            ...(p.scenes[0]!.artwork as Extract<
              NonNullable<(typeof p.scenes)[number]['artwork']>,
              { version: 3 }
            >),
            sourceHash: '0'.repeat(64),
          },
        },
      ],
    }),
  ).toThrow(/hash/i);
});
it.skipIf(
  !existsSync(
    process.env.CHROME_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ),
)(
  '浏览器中混合渲染旧绘图与 V3 程序，且跳转帧可重现',
  async () => {
    const source =
      "TIMO.visual('modern', P => { P.title('从事实重构', { accent: 'yellow' }); P.ring(960, 540, 300, 300, { at: P.c(0), color: 'yellow' }); P.text('事实', { x: 880, y: 490, size: 72, at: P.c(0) }); });";
    const production = {
      aspectRatio: '16:9',
      brief: { style: 'warm', language: 'zh' },
      durationMs: 2000,
      scenes: [
        {
          id: 'legacy',
          title: '拆开假设',
          visual: '旧画面',
          beats: ['假设'],
          cues: [{ id: 'q1', text: '拆开假设。', startMs: 0, endMs: 1000 }],
          artwork: {
            version: 1,
            intent: '一个假设框',
            elements: [
              {
                id: 'assumption',
                type: 'rect',
                x: 300,
                y: 240,
                width: 900,
                height: 360,
                cueIndex: 0,
              },
            ],
          },
        },
        {
          id: 'modern',
          title: '从事实重构',
          visual: 'V3 程序画面',
          beats: ['事实'],
          cues: [
            { id: 'q2', text: '从事实重构。', startMs: 1000, endMs: 2000 },
          ],
          artwork: {
            version: 3,
            runtime: 'timotv-dsl-1',
            intent: '黄色圆环聚焦事实',
            source,
            sourceHash: hashProgramSource(source),
            style: 'chalkboard',
            extras: [],
          },
        },
      ],
    } as unknown as Production;
    const require = createRequire(
      new URL('../packages/renderer/package.json', import.meta.url),
    );
    const { chromium } = require('playwright-core');
    const browser = await chromium.launch({
      executablePath:
        process.env.CHROME_PATH ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 },
      });
      await page.setContent(filmHtml(production, { controls: false }));
      await page.evaluate(() => (window as any).__ready);
      await page.evaluate(() => (window as any).renderAt(500));
      expect(await page.locator('[data-artwork-id="assumption"]').count()).toBe(
        1,
      );
      await page.evaluate(() => (window as any).renderAt(1500));
      expect(
        await page.locator('#stage').getByText('事实').count(),
      ).toBeGreaterThan(0);
      expect(await page.evaluate(() => (window as any).ENGINE.errors)).toEqual(
        [],
      );
      const first = await page.screenshot();
      await page.evaluate(() => (window as any).renderAt(50));
      await page.evaluate(() => (window as any).renderAt(1500));
      expect(await page.screenshot()).toEqual(first);
    } finally {
      await browser.close();
    }
  },
  30_000,
);
it.skipIf(process.platform !== 'darwin' || !process.env.FILM_INTEGRATION)(
  'real local voice and Chrome encode without paid requests',
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'timo-film-'));
    try {
      const p: Production = {
        projectId: 'test',
        revision: 1,
        aspectRatio: '16:9',
        stage: 'narrating',
        brief: {
          topic: '测试',
          materials: '',
          durationSec: 15,
          language: 'zh',
          style: 'warm',
          voiceProvider: 'local',
          voice: 'Tingting',
        },
        scenes: [
          {
            id: 's',
            title: '你好',
            visual: '一颗种子',
            beats: ['萌芽', '生长'],
            cues: [{ id: 'q', text: '你好。' }],
          },
        ],
        artifacts: {},
        events: [],
      };
      const narrated = await narrateFilm({ production: p, root });
      expect(narrated.durationMs).toBeGreaterThan(100);
      expect(filmHtml(narrated)).toContain('renderAt');
      const require = createRequire(
        new URL('../packages/renderer/package.json', import.meta.url),
      );
      const { chromium } = require('playwright-core');
      const browser = await chromium.launch({
        executablePath:
          process.env.CHROME_PATH ||
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
      });
      try {
        const page = await browser.newPage({
          viewport: { width: 1080, height: 1920 },
        });
        await page.setContent(filmHtml({ ...narrated, aspectRatio: '9:16' }));
        await page.evaluate(() => {
          document.querySelector('footer')!.remove();
          (window as any).renderAt(100);
        });
        const bounds = await page.locator('#caption').boundingBox();
        expect(bounds!.x).toBeGreaterThan(0);
        expect(bounds!.y + bounds!.height).toBeLessThan(1920);
        expect(bounds!.x + bounds!.width).toBeLessThan(1080);
      } finally {
        await browser.close();
      }
      const second = await narrateFilm({
        production: { ...p, revision: 2 },
        root,
      });
      expect(second.durationMs).toBe(narrated.durationMs);
      const rendered = await renderFilm({
        production: narrated,
        root,
      });
      expect(
        (await stat(join(root, rendered.artifacts.video!))).size,
      ).toBeGreaterThan(1000);
      const completedVideo = await readFile(
        join(root, rendered.artifacts.video!),
      );
      const previousFfmpeg = process.env.FFMPEG_PATH;
      process.env.FFMPEG_PATH = '/missing-timotv-test-encoder';
      try {
        await expect(
          renderFilm({ production: narrated, root }),
        ).rejects.toThrow();
      } finally {
        if (previousFfmpeg === undefined) delete process.env.FFMPEG_PATH;
        else process.env.FFMPEG_PATH = previousFfmpeg;
      }
      expect(await readFile(join(root, rendered.artifacts.video!))).toEqual(
        completedVideo,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  60000,
);
