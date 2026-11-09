import type { PrismaClient } from '@timotv/db';
import { productionRunStore } from '@timotv/db';
import { createProductionRunner } from '@timotv/core';
import {
  ArtworkValidationError,
  planFilm,
  illustrateFilmSceneProgram,
  writeFilmScript,
  piGenerator,
  modelFailureMessages,
  type JsonGenerator,
} from '@timotv/agent';
import { narrateFilm } from '@timotv/speech';
import { composeFilm, renderFilm } from '@timotv/renderer';
import { ZodError } from 'zod';
import { sceneReviewer } from './review.js';
export function filmError(error: unknown) {
  if (error instanceof ArtworkValidationError) return error.message;
  if (error instanceof ZodError)
    return '模型返回的数据不符合分镜或口播格式，请重新生成';
  const message = error instanceof Error ? error.message : '';
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
  return '制作失败，请检查模型配置、服务连接和本机环境后重试';
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
    async () => {
      const env = await runtimeEnv();
      const model = () => injectedModel ?? piGenerator(env);
      return {
        plan: (p, signal) => planFilm(p, model(), signal),
        script: (p, signal) => writeFilmScript(p, model(), signal),
        narrate: (production, signal) =>
          narrateFilm({ production, root, env, signal }),
        illustrateScene: (production, index, signal) =>
          illustrateFilmSceneProgram(production, index, model(), signal),
        reviewScene: sceneReviewer(root, env),
        repairScene: (production, index, signal) =>
          illustrateFilmSceneProgram(
            production,
            index,
            model(),
            signal,
            JSON.stringify(production.scenes[index].review?.issues ?? []),
          ),
        compose: (production, signal) =>
          composeFilm({ production, root, signal }),
        render: (production, signal) =>
          renderFilm({ production, root, signal }),
      };
    },
    filmError,
  );
}
