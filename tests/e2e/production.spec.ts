import { test, expect } from '@playwright/test';
test('主题入口接受文本资料，不要求讲稿', async ({ page }) => {
  await page.route('**/api/projects', (r) => r.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByLabel('你想讲什么？')).toBeVisible();
  await page.getByLabel('你想讲什么？').fill('为什么天空是蓝色的');
  await page.getByText('添加资料', { exact: true }).click();
  await page.getByLabel('文本资料（可选', { exact: false }).setInputFiles({
    name: 'notes.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# 测试资料\n光的散射'),
  });
  await expect(page.getByLabel('资料内容')).toHaveValue('# 测试资料\n光的散射');
  await page
    .locator('.production-fields > details > summary')
    .filter({ hasText: '创作设置' })
    .click();
  await expect(
    page.getByRole('combobox', { name: '目标时长', exact: true }),
  ).toHaveText('1分钟');
  await expect(
    page.getByRole('combobox', { name: '配音服务', exact: true }),
  ).toHaveText('火山 TTS（豆包语音）');
});

test('shows five-minute duration evidence and one actionable review failure', async ({
  page,
}) => {
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return route.fulfill({
        json: {
          model: { configured: true, provider: 'test', model: 'test' },
          voices: { volcengine: true, local: true, elevenlabs: false },
        },
      });
    if (path.endsWith('/production'))
      return route.fulfill({
        json: {
          projectId: 'duration-ui',
          revision: 2,
          aspectRatio: '16:9',
          stage: 'failed',
          brief: {
            topic: '五分钟管理课',
            materials: '',
            narrationMode: 'ai',
            durationSec: 300,
            language: 'zh',
            style: 'warm',
            voiceProvider: 'volcengine',
            voice: '',
          },
          durationMs: 95_000,
          durationState: {
            status: 'failed',
            targetMs: 300_000,
            minMs: 270_000,
            maxMs: 330_000,
            estimatedMs: 90_000,
            measuredMs: 95_000,
            correctionRound: 2,
          },
          failure: {
            code: 'REVIEW_BROWSER_RUNTIME_FAILED',
            phase: 'reviewing',
            retryable: true,
            publicMessage: '第 1 页关键帧检查失败，可重试本页',
            diagnosticId: '11111111-1111-4111-8111-111111111111',
            context: { sceneId: 'p01' },
          },
          failedAction: 'illustrate',
          scenes: [
            {
              id: 'p01',
              title: '第一页',
              visual: '管理循环',
              beats: ['目标', '反馈'],
              cues: [
                {
                  id: 'c01',
                  text: '测试',
                  startMs: 0,
                  endMs: 95_000,
                  audioKey: 'voice.wav',
                },
              ],
              artwork: { version: 1, intent: 'test', elements: [] },
            },
          ],
          artifacts: { audio: 'audio.wav' },
          events: [],
        },
      });
    return route.fulfill({
      json: {
        id: 'duration-ui',
        title: '时长诊断',
        kind: 'generated',
        aspectRatio: '16:9',
        status: 'draft',
      },
    });
  });

  await page.goto('/#duration-ui');
  const duration = page.locator('.duration-status');
  await expect(duration).toContainText('目标5:00');
  await expect(duration).toContainText('允许区间4:30–5:30');
  await expect(duration).toContainText('真实配音1:35');
  await expect(
    page.getByText('第 1 页关键帧检查失败，可重试本页'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '重试当前页审片' }),
  ).toHaveCount(1);
  await page.getByText('技术信息').click();
  await expect(page.getByText('REVIEW_BROWSER_RUNTIME_FAILED')).toBeVisible();
});

test('parity production shows kit, page, whole-film, preview, and MP4 progress', async ({
  page,
}) => {
  const startedAt = Date.now();
  const scene = {
    id: 'p01',
    title: '天空为什么是蓝色',
    visual: '光线散射',
    beats: ['光线', '散射'],
    cues: [{ id: 'c01', text: '太阳光进入大气层。', startMs: 0, endMs: 1000 }],
  };
  const base = {
    projectId: 'parity-progress',
    videoPipeline: 'drawing-engine-v3',
    revision: 4,
    aspectRatio: '16:9',
    brief: {
      topic: '为什么天空是蓝色的',
      materials: '',
      durationSec: 60,
      language: 'zh',
      style: 'warm',
      voiceProvider: 'local',
      voice: '',
    },
    durationMs: 1000,
    artifacts: { audio: 'audio.wav' },
    events: [],
  };
  const kit = {
    status: 'generating',
    components: [
      {
        name: 'sunBeam',
        what: '同一束太阳光',
        pages: ['p01', 'p02'],
        status: 'generating',
      },
    ],
  };
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities'))
      return route.fulfill({
        json: {
          model: { configured: true, provider: 'test', model: 'test' },
          voices: { local: true, volcengine: false, elevenlabs: false },
        },
      });
    if (path.endsWith('/production')) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 2200)
        return route.fulfill({
          json: {
            ...base,
            stage: 'illustrating',
            jobId: 'kit-job',
            scenes: [scene],
            visual: { filmKit: kit },
          },
        });
      const reviewedScene = {
        ...scene,
        review: {
          fingerprint: 'page',
          status: 'passed',
          mode: 'visual',
          round: 0,
          frames: [],
          issues: [],
          omittedCueIds: [],
        },
      };
      if (elapsed < 4400)
        return route.fulfill({
          json: {
            ...base,
            stage: 'illustrating',
            jobId: 'whole-film-job',
            scenes: [reviewedScene],
            visual: {
              filmKit: {
                ...kit,
                status: 'passed',
                components: [{ ...kit.components[0], status: 'passed' }],
              },
              wholeFilmReview: {
                fingerprint: 'whole',
                status: 'checking',
                round: 0,
                frames: [],
                issues: [],
              },
            },
          },
        });
      return route.fulfill({
        json: {
          ...base,
          stage: 'ready',
          artifacts: { audio: 'audio.wav', preview: 'preview.html' },
          scenes: [reviewedScene],
          visual: {
            filmKit: {
              ...kit,
              status: 'passed',
              components: [{ ...kit.components[0], status: 'passed' }],
            },
            wholeFilmReview: {
              fingerprint: 'whole',
              status: 'passed',
              round: 0,
              frames: [],
              issues: [],
            },
          },
        },
      });
    }
    return route.fulfill({
      json: {
        id: 'parity-progress',
        title: '绘图引擎品质进度',
        kind: 'generated',
        aspectRatio: '16:9',
        status: 'draft',
      },
    });
  });

  await page.goto('/#parity-progress');
  await expect(page.getByText('正在建立影片视觉组件')).toBeVisible();
  await expect(page.getByText('正在进行全片一致性检查')).toBeVisible({
    timeout: 8000,
  });
  await expect(page.getByText('预览已就绪 · 修订 4')).toBeVisible({
    timeout: 8000,
  });
  await expect(
    page.getByRole('button', { name: '导出 MP4', exact: true }),
  ).toBeEnabled();
});
