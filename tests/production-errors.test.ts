import { expect, it } from 'vitest';
import {
  filmError,
  filmFailure,
} from '../apps/worker/src/handlers/production.js';
import { ProductionFailureError } from '../packages/core/src/production/failure.js';
import { productionRunStore } from '../packages/db/src/production-run.js';
import { vi } from 'vitest';
it.each([
  ['MODEL_AUTH_FAILED', '认证失败'],
  ['MODEL_TIMEOUT', '超时'],
  ['MODEL_NO_SUBMISSION', '没有提交'],
  ['MODEL_OUTPUT_LIMIT', '长度上限'],
  ['MODEL_INVALID_SUBMISSION', 'JSON'],
  ['MODEL_SERVICE_ERROR', '模型服务'],
])('保留 %s 的安全具体提示，重复处理不退化成泛化错误', (code, text) => {
  const message = filmError(new Error(code));
  expect(message).toContain(text);
  expect(filmError(new Error(message))).toBe(message);
});
it('明确显示分镜数量限制，未知异常不泄露原文', () => {
  expect(filmError(new Error('分镜页数超出目标时长，请重新规划'))).toContain(
    '分镜页数',
  );
  expect(
    filmError(new Error('provider secret-test-key raw response')),
  ).not.toContain('secret-test-key');
});

it.each([
  ['WHOLE_FILM_CAPTURE_FAILED', 'WHOLE_FILM_CAPTURE_FAILED'],
  ['WHOLE_FILM_REVIEW_INVALID', 'WHOLE_FILM_REVIEW_INVALID'],
  ['WHOLE_FILM_MODEL_FAILED', 'WHOLE_FILM_MODEL_FAILED'],
  ['WHOLE_FILM_REPAIR_FAILED', 'WHOLE_FILM_REPAIR_FAILED'],
])('maps %s to a distinct typed whole-film failure', (message, code) => {
  expect(filmFailure(new Error(message), { phase: 'reviewing' })).toMatchObject(
    { code, phase: 'reviewing', retryable: true },
  );
});

it('atomically persists the stable error code and sanitized failure', async () => {
  const productionUpdate = vi.fn(async () => ({ count: 1 }));
  const jobUpdate = vi.fn(async () => ({ count: 1 }));
  const db = {
    $transaction: (run: (tx: unknown) => unknown) =>
      run({
        production: { updateMany: productionUpdate },
        job: { updateMany: jobUpdate },
        project: { update: vi.fn() },
      }),
  };
  const failure = new ProductionFailureError(
    {
      code: 'TTS_PROVIDER_FAILED',
      phase: 'narrating',
      retryable: true,
      publicMessage: '配音服务暂时不可用，请重试',
      context: { cueId: 'p01-c01' },
    },
    { cause: new Error('Authorization: Bearer private-token') },
  ).failure;
  const production = {
    projectId: 'project',
    revision: 2,
    jobId: 'job',
    stage: 'narrating',
    events: [],
  } as any;

  await productionRunStore(db as never).fail(
    production,
    'job',
    'produce',
    failure,
  );

  expect(productionUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        data: expect.objectContaining({
          failure: expect.objectContaining({
            code: 'TTS_PROVIDER_FAILED',
            context: { cueId: 'p01-c01' },
          }),
          error: '配音服务暂时不可用，请重试',
        }),
      }),
    }),
  );
  expect(jobUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        errorCode: 'TTS_PROVIDER_FAILED',
        errorMessage: '配音服务暂时不可用，请重试',
      }),
    }),
  );
  expect(failure.causeSummary).not.toContain('private-token');
});

it('passes typed artwork diagnostics to the existing durable failure path', async () => {
  const { illustrateFilmScene } =
    await import('../packages/agent/dist/index.js');
  const { createProductionRunner } =
    await import('../packages/core/src/production/runner.js');
  const { productionBriefSchema } =
    await import('../packages/contracts/src/index.js');
  const production: any = {
    projectId: 'diagnostic',
    revision: 1,
    jobId: 'job',
    stage: 'illustrating',
    aspectRatio: '16:9',
    brief: productionBriefSchema.parse({ topic: '测试' }),
    artifacts: { audio: 'saved.wav' },
    events: [],
    scenes: [
      {
        id: 's1',
        title: '第一页',
        cues: [{ id: 'c1', text: '测试', startMs: 0, endMs: 1000 }],
      },
    ],
  };
  let persisted: any;
  const unchanged = async (p: any) => p;
  const runner = createProductionRunner(
    {
      load: async () => ({
        job: { id: 'job', type: 'produce', status: 'queued' } as any,
        production,
      }),
      start: async () => {},
      checkpoint: async () => {},
      complete: async () => {},
      fail: async (p, _id, action, failure) => {
        expect(p.artifacts.audio).toBe('saved.wav');
        expect(action).toBe('produce');
        persisted = failure;
      },
    },
    () => ({
      plan: unchanged,
      script: unchanged,
      narrate: unchanged,
      compose: unchanged,
      render: unchanged,
      illustrateScene: (p, i) =>
        illustrateFilmScene(p, i, {
          generate: async () => ({
            value: { secret: 'raw-secret' },
            usage: { input: 0, output: 0 },
          }),
        }),
    }),
    filmFailure,
  );
  await expect(runner('job')).rejects.toThrow('第 1 页绘图格式校验失败');
  expect(persisted.code).toBe('ARTWORK_VALIDATION_FAILED');
  expect(persisted.publicMessage).toContain('sceneId：缺少必填字段');
  expect(persisted.publicMessage).toContain('artwork：缺少必填字段');
  expect(persisted.causeSummary).not.toContain('raw-secret');
});
