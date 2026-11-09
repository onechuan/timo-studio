import { expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  sceneArtworkSchema,
  type Production,
} from '../../packages/contracts/src/index.js';
import { chromium, type Browser } from '@playwright/test';
import { createRequire } from 'node:module';
// Reuse Playwright's installed PNG decoder in this test only; avoid asynchronous browser image decoding.
const { PNG } = createRequire(
  new URL('../../packages/renderer/package.json', import.meta.url),
)('playwright-core/lib/utilsBundle') as {
  PNG: {
    sync: {
      read: (data: Buffer) => { width: number; height: number; data: Buffer };
    };
  };
};

import { filmHtml } from '../../packages/renderer/src/preview.js';
import * as preview from '../../packages/renderer/src/preview.js';
import { captureSceneReview } from '../../packages/renderer/src/review.js';
import { hashProgramSource } from '../../packages/renderer/src/program.js';
const fixture = (): Production => ({
  projectId: 'capture-test',
  revision: 1,
  stage: 'illustrating',
  aspectRatio: '16:9',
  brief: {
    topic: 'test',
    style: 'warm',
    language: 'en',
  } as Production['brief'],
  durationMs: 2000,
  artifacts: {},
  events: [],
  scenes: [
    {
      id: 'scene',
      title: 'Visible title',
      visual: 'a tree',
      beats: ['Grow'],
      cues: [{ id: 'cue', text: 'A growing tree', startMs: 0, endMs: 2000 }],
    },
  ],
});
const test = it.skipIf(!process.env.RUN_INTEGRATION);
test('large brand typography stays inside its declared layout box', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-brand-text-'));
  try {
    const p = fixture();
    p.brief.style = 'brand';
    p.scenes[0].artwork = sceneArtworkSchema.parse({
      version: 2,
      intent: '品牌字',
      elements: [
        {
          id: 'wordmark',
          type: 'text',
          text: 'TimoTV',
          fontSize: 100,
          x: 180,
          y: 255,
          width: 1240,
          height: 150,
          cueIndex: 0,
          layer: 0,
          fill: 'ink',
          align: 'center',
        },
      ],
    });
    const review = await captureSceneReview(
      p,
      0,
      root,
      AbortSignal.timeout(20000),
    );
    expect(review.issues.filter((i) => i.severity === 'error')).toEqual([]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('real Chrome captures isolated evidence at export dimensions, without paid APIs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-'));
  const abort = new AbortController();
  let directBrowser: Browser | undefined;
  // Fail before Vitest's 30s deadline, allowing finally blocks to close Chrome.
  const watchdog = setTimeout(() => {
    abort.abort(new Error('Review capture test exceeded 20s execution budget'));
    void directBrowser?.close().catch(() => {});
  }, 20000);
  try {
    const p = fixture(),
      a = await captureSceneReview(p, 0, root, abort.signal),
      b = await captureSceneReview(p, 0, root, abort.signal);
    expect(a.frames.map((f) => f.timeMs)).toEqual([0, 1000, 1999]);
    expect(a.frames[0].key).not.toBe(b.frames[0].key);
    const png = await readFile(join(root, a.frames[0].key));
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1920);
    expect(png.readUInt32BE(20)).toBe(1080);
    expect(a.issues.filter((i) => i.severity === 'error')).toEqual([]);
    let executablePath = process.env.CHROME_PATH;
    for (const candidate of [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
    ]) {
      if (executablePath) break;
      try {
        await access(candidate);
        executablePath = candidate;
      } catch {}
    }
    abort.signal.throwIfAborted();
    const browser = (directBrowser = await chromium.launch({
      executablePath,
      headless: true,
      timeout: 5000,
    }));
    try {
      abort.signal.throwIfAborted();
      const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });
      page.setDefaultTimeout(5000);
      await page.setContent(filmHtml(p, { controls: false }));
      await page.evaluate(async () => {
        await document.fonts.ready;
        (window as any).renderAt(0);
      });
      const direct = await page.screenshot();
      // Separate Chrome processes can differ slightly at anti-aliased SVG edges.
      // Compare decoded pixels, allowing at most 0.025% edge raster variation.
      const decoded = [png, direct].map((buffer) => PNG.sync.read(buffer));
      expect(decoded.map((image) => [image.width, image.height])).toEqual([
        [1920, 1080],
        [1920, 1080],
      ]);
      const [left, right] = decoded.map((image) => image.data);
      let changedPixels = 0;
      for (let i = 0; i < left.length; i += 4) {
        if (
          left[i] !== right[i] ||
          left[i + 1] !== right[i + 1] ||
          left[i + 2] !== right[i + 2] ||
          left[i + 3] !== right[i + 3]
        )
          changedPixels++;
      }
      expect(changedPixels / (1920 * 1080)).toBeLessThan(0.00025);
    } finally {
      await browser.close();
    }
    const portrait = await captureSceneReview(
      { ...p, aspectRatio: '9:16' },
      0,
      root,
      abort.signal,
    );
    const tall = await readFile(join(root, portrait.frames[0].key));
    expect(tall.readUInt32BE(16)).toBe(1080);
    expect(tall.readUInt32BE(20)).toBe(1920);
  } finally {
    clearTimeout(watchdog);
    await rm(root, { recursive: true, force: true });
  }
}, 30000);
test('browser measures clipped text, subtitle overlap and motion excursion between screenshots', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-'));
  try {
    const p = fixture();
    p.durationMs = 22000;
    p.scenes[0].cues = Array.from({ length: 22 }, (_, i) => ({
      id: i === 0 ? 'cue' : `cue${i}`,
      text: 'A growing tree',
      startMs: i * 1000,
      endMs: (i + 1) * 1000,
    }));
    p.scenes[0].artwork = sceneArtworkSchema.parse({
      version: 2,
      intent: 'test',
      elements: [
        {
          id: 'label',
          type: 'text',
          text: 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
          x: 200,
          y: 250,
          width: 25,
          height: 25,
          fontSize: 24,
          cueIndex: 0,
          layer: 0,
        },
        {
          id: 'subject',
          type: 'ellipse',
          x: 700,
          y: 300,
          width: 300,
          height: 200,
          cueIndex: 0,
          layer: 0,
        },
      ],
      tracks: [
        {
          elementId: 'subject',
          property: 'move',
          keyframes: [
            { at: { cueId: 'cue', progress: 0 }, value: { x: 700, y: 300 } },
            {
              at: { cueId: 'cue', progress: 0.125 },
              value: { x: 700, y: 720 },
            },
            {
              at: { cueId: 'cue', progress: 0.25 },
              value: { x: 2000, y: 400 },
            },
            { at: { cueId: 'cue', progress: 0.5 }, value: { x: 700, y: 300 } },
            { at: { cueId: 'cue', progress: 1 }, value: { x: 700, y: 300 } },
          ],
        },
      ],
    });
    const result = await captureSceneReview(p, 0, root);
    expect(
      result.issues.some(
        (i) => i.elementIds.includes('label') && i.what.includes('超出对象'),
      ),
    ).toBe(true);
    expect(
      result.issues.some(
        (i) => i.elementIds.includes('subject') && i.what.includes('字幕'),
      ),
    ).toBe(true);
    expect(
      result.issues.some(
        (i) => i.elementIds.includes('subject') && i.what.includes('超出画面'),
      ),
    ).toBe(true);
    const excursion = result.issues.find(
      (i) => i.elementIds.includes('subject') && i.what.includes('超出画面'),
    )!;
    expect(result.frames.some((f) => f.timeMs === excursion.atMs)).toBe(false);
    p.durationMs = 2000;
    p.scenes[0].cues = [
      { id: 'cue', text: 'A growing tree', startMs: 0, endMs: 2000 },
    ];
    p.scenes[0].artwork = sceneArtworkSchema.parse({
      version: 1,
      intent: 'clipped legacy text',
      elements: [
        {
          id: 'clipped',
          type: 'text',
          text: 'M'.repeat(200),
          x: 200,
          y: 250,
          width: 25,
          height: 25,
          fontSize: 24,
          cueIndex: 0,
          layer: 0,
        },
      ],
    });
    const legacy = await captureSceneReview(p, 0, root);
    expect(
      legacy.issues.some(
        (i) => i.elementIds.includes('clipped') && i.what.includes('裁切'),
      ),
    ).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30000);
test('rejects symlink asset directories before writing screenshots', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-')),
    other = await mkdtemp(join(tmpdir(), 'timo-other-'));
  try {
    await symlink(other, join(root, 'production'));
    await expect(captureSceneReview(fixture(), 0, root)).rejects.toThrow(
      'symlink',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(other, { recursive: true, force: true });
  }
});

test('a visible rectangle is a subject and intentional background overlap is not a hard error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-'));
  try {
    const p = fixture();
    p.scenes[0].artwork = sceneArtworkSchema.parse({
      version: 2,
      intent: 'geometry',
      elements: [
        {
          id: 'background',
          type: 'rect',
          x: 100,
          y: 200,
          width: 1200,
          height: 450,
          fill: 'panel',
          layer: -1,
          cueIndex: 0,
        },
        {
          id: 'shape',
          type: 'rect',
          x: 200,
          y: 300,
          width: 200,
          height: 150,
          cueIndex: 0,
          layer: 0,
        },
      ],
      tracks: [],
    });
    const result = await captureSceneReview(p, 0, root);
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30000);

test('abort during browser capture rejects promptly', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-')),
    abort = new AbortController();
  const timer = setTimeout(
    () => abort.abort(new Error('capture cancelled')),
    100,
  );
  try {
    await expect(
      captureSceneReview(fixture(), 0, root, abort.signal),
    ).rejects.toThrow();
  } finally {
    clearTimeout(timer);
    await rm(root, { recursive: true, force: true });
  }
}, 10000);

test('returns deterministic in-page rendering failures as repairable runtime evidence', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-review-'));
  const html = vi
    .spyOn(preview, 'filmHtml')
    .mockReturnValue(
      '<script>window.renderAt = () => { throw new Error("broken scene fixture") }</script>',
    );
  try {
    const result = await captureSceneReview(fixture(), 0, root);
    expect(result.frames).toEqual([]);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        kind: 'runtime',
        severity: 'error',
        what: 'broken scene fixture',
      }),
    );
  } finally {
    html.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
}, 10000);

test('captures V3 PNG evidence and reports drawing-engine page failures', async () => {
  const root = await mkdtemp(join(tmpdir(), 'timo-v3-review-'));
  try {
    const p = fixture();
    const valid =
      "TIMO.visual('scene', P => { P.title('Evidence', { accent: 'yellow' }); P.ring(960, 540, 260, 260, { at: P.c(0), color: 'yellow' }); });";
    p.scenes[0]!.artwork = {
      version: 3,
      runtime: 'timotv-dsl-1',
      intent: 'A highlighted evidence ring',
      source: valid,
      sourceHash: hashProgramSource(valid),
      style: 'chalkboard',
      extras: [],
    };
    const captured = await captureSceneReview(p, 0, root);
    expect(captured.frames.map((frame) => frame.timeMs)).toEqual([
      0, 1000, 1999,
    ]);
    expect(
      (await readFile(join(root, captured.frames[0]!.key)))
        .subarray(1, 4)
        .toString(),
    ).toBe('PNG');
    expect(captured.issues.filter((issue) => issue.kind === 'runtime')).toEqual(
      [],
    );

    const broken =
      "TIMO.visual('scene', P => { P.title('Broken'); P.methodThatDoesNotExist(); });";
    p.scenes[0]!.artwork = {
      ...p.scenes[0]!.artwork,
      source: broken,
      sourceHash: hashProgramSource(broken),
    };
    const failed = await captureSceneReview(p, 0, root);
    expect(failed.frames).toEqual([]);
    expect(failed.issues).toContainEqual(
      expect.objectContaining({
        kind: 'runtime',
        severity: 'error',
        what: expect.stringContaining('methodThatDoesNotExist'),
      }),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30000);
