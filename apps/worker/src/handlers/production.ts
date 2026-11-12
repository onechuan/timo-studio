import type { PrismaClient } from '@timotv/db';
import { productionRunStore } from '@timotv/db';
import {
  createProductionRunner,
  ProductionFailureError,
  toProductionFailure,
  type ProductionFailureFallback,
  type ProductionOperations,
} from '@timotv/core';
import {
  resolveVideoPipeline,
  type ProductionFailure,
  type ProductionPhase,
} from '@timotv/contracts';
import {
  ArtworkValidationError,
  planFilm,
  illustrateFilmSceneProgram,
  writeFilmScript,
  piGenerator,
  modelFailureMessages,
  reviseScriptForDuration,
  type JsonGenerator,
} from '@timotv/agent';
import { narrateFilm } from '@timotv/speech';
import { composeFilm, renderFilm } from '@timotv/renderer';
import { ZodError } from 'zod';
import { sceneReviewer } from './review.js';
import {
  filmKitReviewer,
  generateProductionFilmKitPart,
  planProductionFilmKit,
} from './film-kit.js';
import { wholeFilmReviewer } from './whole-film.js';
export function filmError(error: unknown) {
  if (error instanceof ProductionFailureError)
    return error.failure.publicMessage;
  if (error instanceof ArtworkValidationError) return error.message;
  if (error instanceof ZodError)
    return '模型返回的数据不符合分镜或口播格式，请重新生成';
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('WHOLE_FILM_'))
    return '整片视觉检查或定向修正失败，请重试；已完成的配音和页面不会丢失';
  if (message.startsWith('REVIEW_')) {
    const original = modelFailureMessages[message.slice('REVIEW_'.length)];
    return original
      ? original
          .replaceAll('导演模型', '视觉审片模型')
          .replace('分镜或口播', '审片')
      : '视觉审片失败，请检查识图模型配置和网络后重试本页审片';
  }
  const modelMessage = Object.hasOwn(modelFailureMessages, message)
    ? modelFailureMessages[message]
    : undefined;
  if (modelMessage) return modelMessage;
  if (Object.values(modelFailureMessages).includes(message)) return message;
  if (
    [
      '分镜页数超出目标时长，请重新规划',
      '口播必须逐页覆盖已批准分镜，保持顺序和 ID',
      '缺少已批准的分镜',
      '绘图需要已完成配音的逐句时间',
      '绘图格式校验失败，请重试绘图',
      '画面无法渲染，请重绘问题页',
      '画面修正服务不可用',
    ].includes(message)
  )
    return message;
  if (/MODEL_NOT_CONFIGURED/.test(message))
    return '导演模型未配置，请前往设置页配置后重试';
  if (/voice|say|ElevenLabs|语音|火山|VOLCENGINE/i.test(message))
    return '配音失败，请检查音色是否可用、配音 Key 与网络连接';
  if (/Chrome|browser/i.test(message))
    return '无法启动渲染浏览器，请安装 Chrome 或设置 CHROME_PATH';
  if (/ffmpeg|ENOENT/i.test(message))
    return '媒体处理失败，请检查 FFmpeg 安装与磁盘空间';
  return '制作过程遇到未识别错误，请稍后重试；若持续失败，请查看诊断详情';
}

const domainFailureCodes = new Map<string, string>([
  ['分镜页数超出目标时长，请重新规划', 'STORYBOARD_DURATION_INVALID'],
  ['口播必须逐页覆盖已批准分镜，保持顺序和 ID', 'SCRIPT_STORYBOARD_MISMATCH'],
  ['缺少已批准的分镜', 'STORYBOARD_APPROVAL_MISSING'],
  ['绘图需要已完成配音的逐句时间', 'NARRATION_TIMING_MISSING'],
  ['绘图格式校验失败，请重试绘图', 'ARTWORK_VALIDATION_FAILED'],
  ['画面无法渲染，请重绘问题页', 'ARTWORK_RUNTIME_FAILED'],
  ['画面修正服务不可用', 'ARTWORK_REPAIR_UNAVAILABLE'],
]);

function typedFailure(
  error: unknown,
  fallback: ProductionFailureFallback,
  code: string,
  phase: ProductionPhase,
  retryable: boolean,
  publicMessage = filmError(error),
): ProductionFailure {
  return new ProductionFailureError(
    {
      code,
      phase,
      retryable,
      publicMessage,
      context: fallback.context,
    },
    { cause: error },
  ).failure;
}

export function filmFailure(
  error: unknown,
  fallback: ProductionFailureFallback,
): ProductionFailure {
  if (error instanceof ProductionFailureError) return error.failure;

  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('WHOLE_FILM_'))
    return typedFailure(error, fallback, message, 'reviewing', true);
  if (error instanceof ArtworkValidationError)
    return typedFailure(
      error,
      fallback,
      'ARTWORK_VALIDATION_FAILED',
      'illustrating',
      true,
    );
  if (error instanceof ZodError)
    return typedFailure(
      error,
      fallback,
      'MODEL_STRUCTURED_OUTPUT_INVALID',
      fallback.phase,
      true,
    );
  if (message.startsWith('REVIEW_'))
    return typedFailure(
      error,
      fallback,
      'REVIEW_MODEL_FAILED',
      'reviewing',
      true,
    );

  const modelCode = Object.hasOwn(modelFailureMessages, message)
    ? message
    : Object.entries(modelFailureMessages).find(
        ([, publicMessage]) => publicMessage === message,
      )?.[0];
  if (modelCode)
    return typedFailure(
      error,
      fallback,
      modelCode,
      fallback.phase,
      !['MODEL_AUTH_FAILED', 'MODEL_NOT_FOUND'].includes(modelCode),
    );

  const domainCode = domainFailureCodes.get(message);
  if (domainCode)
    return typedFailure(error, fallback, domainCode, fallback.phase, true);
  if (/voice|say|ElevenLabs|语音|火山|VOLCENGINE/i.test(message))
    return typedFailure(
      error,
      fallback,
      'TTS_PROVIDER_FAILED',
      'narrating',
      true,
    );
  if (/Chrome|browser/i.test(message))
    return typedFailure(
      error,
      fallback,
      'BROWSER_RUNTIME_UNAVAILABLE',
      fallback.phase,
      true,
    );
  if (/ffmpeg|ENOENT/i.test(message))
    return typedFailure(
      error,
      fallback,
      'FFMPEG_PROCESS_FAILED',
      fallback.phase,
      true,
    );
  if (/Prisma|postgres|database|数据库/i.test(message))
    return typedFailure(
      error,
      fallback,
      'DATABASE_OPERATION_FAILED',
      'storage',
      true,
    );
  if (/BullMQ|Redis|queue|队列/i.test(message))
    return typedFailure(
      error,
      fallback,
      'QUEUE_OPERATION_FAILED',
      'queue',
      true,
    );

  return toProductionFailure(error, {
    ...fallback,
    publicMessage: filmError(error),
  });
}
export function productionHandler(
  db: PrismaClient,
  root: string,
  injectedModel?: JsonGenerator,
  runtimeEnv: () => Promise<NodeJS.ProcessEnv> = async () => ({
    ...process.env,
  }),
) {
  return createProductionRunner(
    productionRunStore(db),
    async (production) => {
      const env = await runtimeEnv();
      const model = () => injectedModel ?? piGenerator(env);
      const common: ProductionOperations = {
        plan: (p, signal) => planFilm(p, model(), signal),
        script: (p, signal) => writeFilmScript(p, model(), signal),
        narrate: (production, signal) =>
          narrateFilm({ production, root, env, signal }),
        reviseDuration: (production, targetMs, signal) =>
          reviseScriptForDuration(production, targetMs, model(), signal),
        illustrateScene: (production, index, signal) =>
          illustrateFilmSceneProgram(production, index, model(), signal),
        reviewScene: sceneReviewer(root, env),
        repairScene: (production, index, signal, feedback) =>
          illustrateFilmSceneProgram(
            production,
            index,
            model(),
            signal,
            feedback ??
              JSON.stringify(production.scenes[index].review?.issues ?? []),
          ),
        compose: (production, signal) =>
          composeFilm({ production, root, signal }),
        render: (production, signal) =>
          renderFilm({ production, root, signal }),
      };
      const pipeline = resolveVideoPipeline(
        production.videoPipeline ?? 'legacy-v3',
        env,
      );
      return pipeline === 'drawing-engine-v3'
        ? {
            ...common,
            planFilmKit: async (production) =>
              planProductionFilmKit(production),
            generateFilmKitPart: (production, name, signal) =>
              generateProductionFilmKitPart(production, name, model(), signal),
            reviewFilmKit: filmKitReviewer(root, env),
            reviewWholeFilm: wholeFilmReviewer(root, env),
          }
        : common;
    },
    filmFailure,
  );
}
