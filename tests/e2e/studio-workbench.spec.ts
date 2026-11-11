import { expect, test, type Page } from '@playwright/test';
import { filmHtml } from '../../packages/renderer/src/preview.js';
import type { Production } from '../../packages/contracts/src/production.js';
// Silent PCM fixture: browser transport tests never invoke a model or TTS service.
function silentWav(seconds: number) {
  const size = seconds * 8000 * 2,
    data = Buffer.alloc(44 + size);
  data.write('RIFF');
  data.writeUInt32LE(36 + size, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(8000, 24);
  data.writeUInt32LE(16000, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(size, 40);
  return data;
}
const board = {
  title: '一颗咖啡豆的旅行',
  summary: '从果实到杯子的三个瞬间',
  scenes: ['生长', '烘焙', '萃取'].map((title, i) => ({
    id: `s${i}`,
    title,
    say: `讲述${title}`,
    visual: `${title}的画面`,
    beats: ['出现', '转场'],
  })),
};
function production(stage = 'approval') {
  return {
    projectId: 'studio',
    revision: 1,
    aspectRatio: '9:16',
    stage,
    brief: {
      topic: '一颗咖啡豆的旅行',
      materials: '',
      durationSec: 60,
      language: 'zh',
      style: 'warm',
      voiceProvider: 'volcengine',
      voice: '',
    },
    storyboard: board,
    scenes:
      stage === 'approval'
        ? []
        : board.scenes.map((s, i) => ({
            ...s,
            cues: [
              {
                id: `c-${s.id}`,
                text: `${s.title}口播`,
                startMs: i * 2000,
                endMs: (i + 1) * 2000,
              },
            ],
          })),
    artifacts: {},
    events: [{ at: '2026-11-08T10:00:00Z', message: '分镜规划完成，等待确认' }],
  };
}
async function setup(page: Page, stage = 'approval') {
  let doc = production(stage);
  const actions: string[] = [];
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return route.fulfill({
        json: {
          model: {
            configured: true,
            provider: 'deepseek',
            model: 'deepseek-flash',
          },
          voices: { volcengine: true, local: true, elevenlabs: false },
        },
      });
    if (path.endsWith('/timeline'))
      return route.fulfill({
        status: 503,
        json: { error: { message: '旧时间轴不可用' } },
      });
    if (path.endsWith('/actions')) {
      actions.push(route.request().postDataJSON().action);
      return route.fulfill({
        json: { ...doc, stage: 'scripting', jobId: 'job' },
      });
    }
    if (path.endsWith('/production')) {
      if (route.request().method() === 'PUT')
        doc = {
          ...doc,
          storyboard: route.request().postDataJSON().storyboard,
          revision: doc.revision + 1,
        };
      return route.fulfill({ json: doc });
    }
    return route.fulfill({
      json: {
        id: 'studio',
        title: '咖啡的故事',
        kind: 'generated',
        aspectRatio: '9:16',
        status: 'draft',
      },
    });
  });
  await page.goto('/#studio');
  return actions;
}
test('选择分镜编辑并先保存后审批，手机也能切换到画面', async ({
  page,
}, info) => {
  const actions = await setup(page);
  await expect(page.getByText('项目设置与诊断', { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('heading', { name: '导演', exact: true }),
  ).toBeVisible();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('button', { name: '分镜 2：烘焙', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: '标题', exact: true }),
  ).toHaveValue('烘焙');
  await page
    .getByRole('combobox', { name: '画面构图', exact: true })
    .selectOption('sequence');
  await page
    .getByRole('textbox', { name: '标题', exact: true })
    .fill('烘焙的温度');
  await page.getByRole('button', { name: '保存分镜修改', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '分镜 2：烘焙的温度', exact: true }),
  ).toBeVisible();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '导演流程', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '批准分镜并自动制作' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: '批准分镜并自动制作' }).click();
  await expect.poll(() => actions).toEqual(['approve']);
  expect(
    await page
      .locator('body')
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});

test('已配音项目可以只重绘画面，无需再次配音', async ({ page }, info) => {
  const actions = await setup(page, 'ready');
  await page.route('**/api/projects/studio/production', (route) =>
    route.fulfill({
      json: {
        ...production('ready'),
        durationMs: 6000,
        timingSource: 'audio-per-cue',
        artifacts: {
          audio: 'studio/r1/audio.wav',
          subtitles: 'studio/r1/subtitles.srt',
        },
      },
    }),
  );
  await page.reload();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('button', { name: '绘制画面', exact: true }).click();
  await expect.poll(() => actions).toEqual(['illustrate']);
});
test('未保存分镜不能批准；口播标签显示所选分镜的文本', async ({
  page,
}, info) => {
  await setup(page);
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page
    .getByRole('textbox', { name: '标题', exact: true })
    .fill('未保存的分镜');
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '导演流程', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '批准分镜并自动制作' }),
  ).toBeDisabled();
  await setup(page, 'ready');
  await page.reload();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('button', { name: '分镜 3：萃取', exact: true }).click();
  await page.getByRole('tab', { name: '口播', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: '口播 c-s2', exact: true }),
  ).toHaveValue('萃取口播');
  await page.screenshot({
    path: `test-results/studio-workbench-${info.project.name}.png`,
    fullPage: true,
  });
});

test('绘图失败可放弃已有画面重新绘制全部', async ({ page }, info) => {
  await setup(page, 'failed');
  const doc = production('failed');
  await page.route('**/api/projects/studio/production', (route) =>
    route.fulfill({
      json: {
        ...doc,
        failedAction: 'illustrate',
        durationMs: 6000,
        scenes: doc.scenes.map((s, i) =>
          i
            ? s
            : {
                ...s,
                artwork: { version: 1, intent: '已有画面', elements: [] },
              },
        ),
        artifacts: { audio: 'studio/r1/audio.wav' },
      },
    }),
  );
  await page.reload();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/actions') && r.method() === 'POST',
  );
  await page.getByRole('button', { name: '重新绘制全部', exact: true }).click();
  expect((await request).postDataJSON()).toMatchObject({
    action: 'illustrate',
    restart: true,
  });
});

test('可以只重绘选中的分镜', async ({ page }, info) => {
  await setup(page, 'ready');
  const doc = production('ready');
  await page.route('**/api/projects/studio/production', (route) =>
    route.fulfill({
      json: {
        ...doc,
        durationMs: 6000,
        scenes: doc.scenes.map((s) => ({
          ...s,
          artwork: { version: 1, intent: '已有画面', elements: [] },
        })),
        artifacts: { audio: 'studio/r1/audio.wav' },
      },
    }),
  );
  await page.reload();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('button', { name: '分镜 2：烘焙', exact: true }).click();
  const request = page.waitForRequest(
    (r) => r.url().endsWith('/actions') && r.method() === 'POST',
  );
  await page.getByRole('button', { name: '重绘本页', exact: true }).click();
  expect((await request).postDataJSON()).toMatchObject({
    action: 'illustrate',
    sceneId: 's1',
  });
});

test('导出后直接展示 MP4 并提供下载，已有成品不重复提交任务', async ({
  page,
}) => {
  await setup(page, 'ready');
  let exporting = false,
    completed = false,
    submissions = 0;
  const doc = () => ({
    ...production('ready'),
    durationMs: 6000,
    stage: exporting && !completed ? 'rendering' : 'ready',
    jobId: exporting && !completed ? 'export-job' : undefined,
    artifacts: {
      audio: 'studio/r1/audio.wav',
      ...(completed ? { video: 'studio/r1/video.mp4' } : {}),
    },
  });
  await page.route('**/api/projects/studio/production', (route) =>
    route.fulfill({ json: doc() }),
  );
  await page.route('**/api/projects/studio/production/actions', (route) => {
    expect(route.request().postDataJSON().action).toBe('export');
    submissions++;
    exporting = true;
    return route.fulfill({ json: doc() });
  });
  // Transport fixture; actual MP4 decoding is verified against the real exported file.
  await page.route('**/production/files/**/video.mp4', (route) =>
    route.fulfill({
      contentType: 'video/mp4',
      body: Buffer.from('download-fixture'),
    }),
  );
  await page.reload();
  await page.getByRole('button', { name: '导出 MP4', exact: true }).click();
  await expect(
    page.getByRole('tab', { name: '导出', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByText('正在生成 MP4，完成后可在这里播放和下载。', { exact: true }),
  ).toBeVisible();
  completed = true;
  await expect(page.getByLabel('已导出 MP4', { exact: true })).toBeVisible();
  await expect(page.getByLabel('已导出 MP4', { exact: true })).toBeInViewport();
  await expect(page.getByTitle('视频预览')).toHaveCount(0);
  await expect(page.getByLabel('已导出 MP4', { exact: true })).toHaveAttribute(
    'src',
    /video\.mp4$/,
  );
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载 MP4', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.mp4$/);
  expect(submissions).toBe(1);
  await page.reload();
  await expect(
    page.getByRole('link', { name: '下载 MP4', exact: true }),
  ).toBeVisible();
  expect(submissions).toBe(1);
});

test('审片报告显示证据并且只提交选中页的修复与接受操作', async ({
  page,
}, info) => {
  await setup(page, 'ready');
  const doc = {
    ...production('ready'),
    durationMs: 6000,
    artifacts: {
      audio: 'production/studio/r1/audio.wav',
      preview: 'production/studio/r1/preview.html',
    },
    scenes: production('ready').scenes.map((s, i) => ({
      ...s,
      review: {
        fingerprint: 'hash',
        status: i === 0 ? 'needs_attention' : 'unreviewed',
        round: 2,
        mode: 'layout',
        frames: [{ key: 'studio/frame.png', timeMs: 1000 }],
        omittedCueIds: [],
        issues:
          i === 0
            ? [
                {
                  kind: 'visual',
                  severity: 'warning',
                  atMs: 500,
                  elementIds: [],
                  what: '标题被主体遮住',
                  fix: '将主体向右移动',
                },
              ]
            : [],
      },
    })),
  };
  await page.route('**/api/projects/studio/production', (r) =>
    r.fulfill({ json: doc }),
  );
  const submissions: any[] = [];
  await page.route('**/production/files/**/preview.html', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: filmHtml(doc as unknown as Production),
    }),
  );
  await page.route('**/production/files/**/audio.wav', (r) => {
    const data = silentWav(6),
      range = /^bytes=(\d+)-(\d*)$/.exec(r.request().headers().range ?? ''),
      start = Number(range?.[1] ?? 0),
      end = range?.[2] ? Number(range[2]) : data.length - 1;
    return r.fulfill({
      status: range ? 206 : 200,
      contentType: 'audio/wav',
      headers: {
        'Accept-Ranges': 'bytes',
        ...(range
          ? { 'Content-Range': `bytes ${start}-${end}/${data.length}` }
          : {}),
      },
      body: data.subarray(start, end + 1),
    });
  });
  await page.route('**/production/files/**/frame.png', (r) =>
    r.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC+8AAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.route('**/api/projects/studio/production/actions', (r) => {
    const body = r.request().postDataJSON();
    submissions.push(body);
    if (body.action === 'accept') doc.scenes[0].review.status = 'accepted';
    return r.fulfill({ json: doc });
  });
  await page.reload();
  if (info.project.name === 'mobile')
    await page.getByRole('button', { name: '画面工作台', exact: true }).click();
  await page.getByRole('tab', { name: '审片', exact: true }).click();
  await expect(page.getByText('标题被主体遮住', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: '第 1 页 1.0 秒关键帧 1.0 秒' })
    .click();
  const audio = page.frameLocator('iframe[title="视频预览"]').locator('audio');
  await expect
    .poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime))
    .toBeCloseTo(1, 1);
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await page.getByRole('tab', { name: '审片', exact: true }).click();
  await page.getByRole('button', { name: '仅修复本页', exact: true }).click();
  await expect.poll(() => submissions.at(-1)?.action).toBe('repair');
  expect(submissions.at(-1)?.sceneId).toBe('s0');
  await page.getByRole('button', { name: '接受当前页', exact: true }).click();
  await expect(page.getByText('已人工接受', { exact: true })).toBeVisible();
  expect(submissions.at(-1)?.action).toBe('accept');
  await page.getByLabel('审片分镜').selectOption('1');
  await expect(
    page.getByText('仅完成布局检查，未进行视觉审片。', { exact: false }),
  ).toBeVisible();
});

for (const aspectRatio of ['16:9', '9:16']) {
  test(`已生成预览保留 ${aspectRatio} 画幅与下载入口`, async ({
    page,
  }, info) => {
    await setup(page, 'ready');
    await page.route('**/api/projects/studio/production', (route) =>
      route.fulfill({
        json: {
          ...production('ready'),
          aspectRatio,
          durationMs: 6000,
          artifacts: {
            preview: 'studio/r1/preview.html',
            audio: 'studio/r1/audio.wav',
            subtitles: 'studio/r1/subtitles.srt',
          },
        },
      }),
    );
    await page.route('**/production/files/**/preview.html', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: filmHtml({
          ...production('ready'),
          aspectRatio,
          durationMs: 6000,
        } as Production),
      }),
    );
    await page.route('**/production/files/**/audio.wav', (route) => {
      const data = silentWav(6);
      const range = /^bytes=(\d+)-(\d*)$/.exec(
        route.request().headers().range ?? '',
      );
      const start = Number(range?.[1] ?? 0),
        end = range?.[2] ? Number(range[2]) : data.length - 1;
      return route.fulfill({
        status: range ? 206 : 200,
        contentType: 'audio/wav',
        headers: {
          'Accept-Ranges': 'bytes',
          ...(range
            ? { 'Content-Range': `bytes ${start}-${end}/${data.length}` }
            : {}),
        },
        body: data.subarray(start, end + 1),
      });
    });
    await page.reload();
    if (info.project.name === 'mobile')
      await page
        .getByRole('button', { name: '画面工作台', exact: true })
        .click();
    const frame = page.getByTitle('视频预览');
    await expect(frame).toBeVisible();
    const rect = await frame.boundingBox();
    const [w, h] = aspectRatio.split(':').map(Number);
    expect(rect!.width / rect!.height).toBeCloseTo(w / h, 1);
    const player = page.frameLocator('iframe[title="视频预览"]');
    await expect(
      player.getByRole('button', { name: '开始播放', exact: true }),
    ).toBeVisible();
    await expect(
      player.getByRole('slider', { name: '播放进度' }),
    ).toBeVisible();
    await expect(player.getByLabel('播放时间', { exact: true })).toContainText(
      '0:00',
    );
    await player.getByRole('button', { name: '开始播放', exact: true }).click();
    await expect(
      player.getByRole('button', { name: '暂停', exact: true }),
    ).toBeVisible();
    // Real pointer presses span multiple animation frames; replaced SVG targets lose clicks.
    await player
      .getByRole('button', { name: '暂停', exact: true })
      .click({ delay: 160 });
    expect(
      await player.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
    ).toBe(true);
    const pausedAt = await player
      .locator('audio')
      .evaluate((a: HTMLAudioElement) => a.currentTime);
    await player
      .locator('audio')
      .evaluate(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(
      await player
        .locator('audio')
        .evaluate((a: HTMLAudioElement) => a.currentTime),
    ).toBe(pausedAt);
    await player
      .getByRole('button', { name: '开始播放', exact: true })
      .click({ delay: 160 });
    await player
      .locator('#stage')
      .click({ position: { x: 90, y: 90 }, delay: 160 });
    expect(
      await player.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
    ).toBe(true);
    await player.getByRole('slider', { name: '播放进度' }).fill('3000');
    await expect(player.locator('h1')).toHaveText('烘焙');
    await expect(player.getByLabel('播放时间', { exact: true })).toContainText(
      '0:03',
    );
    await expect(
      player.getByRole('combobox', { name: '播放速度' }),
    ).toBeVisible();
    await expect(
      player.getByRole('button', { name: '全屏', exact: true }),
    ).toBeVisible();
    expect(
      await player
        .locator('body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/player-${aspectRatio.replace(':', '-')}-${info.project.name}.png`,
      fullPage: true,
    });
    if (info.project.name === 'desktop' && aspectRatio === '16:9') {
      await player.getByRole('slider', { name: '播放进度' }).fill('0');
      await player
        .getByRole('button', { name: '开始播放', exact: true })
        .click();
      await page.mouse.move(0, 0);
      await expect(player.locator('body')).toHaveClass(/player-idle/);
      await player.locator('#stage').press('Space');
      await expect(player.locator('body')).not.toHaveClass(/player-idle/);
      await expect(
        player.getByRole('button', { name: '开始播放', exact: true }),
      ).toBeVisible();
    }
    // A failed media request must remain actionable, rather than silently pretending to play.
    await page.route('**/production/files/**/audio.wav', (route) =>
      route.fulfill({ status: 503, body: 'Unavailable' }),
    );
    await player
      .locator('audio')
      .evaluate((audio: HTMLAudioElement) => audio.load());
    await expect(player.getByRole('alert')).toContainText('音频加载失败');
    await page.getByRole('tab', { name: '导出', exact: true }).click();
    await expect(
      page.getByRole('link', { name: '下载配音 WAV' }),
    ).toHaveAttribute('href', /audio.wav$/);
    await expect(
      page.getByRole('link', { name: '下载字幕 SRT' }),
    ).toHaveAttribute('href', /subtitles.srt$/);
    expect(
      await page
        .locator('body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  });
}
