import { Agent } from '@earendil-works/pi-agent-core';
import {
  InMemoryCredentialStore,
  createProvider,
  envApiKeyAuth,
  type ImageContent,
  type Api,
  type Model,
} from '@earendil-works/pi-ai';
import { builtinModels } from '@earendil-works/pi-ai/providers/all';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { anthropicMessagesApi } from '@earendil-works/pi-ai/api/anthropic-messages.lazy';
import { Type, type TSchema } from 'typebox';
import type { JsonGenerator } from '../director/index.js';
import { providerFailureCode } from './failures.js';
import { withModelRetry } from './retry.js';
export function modelConfig(env: NodeJS.ProcessEnv = process.env) {
  const provider = env.TIMO_PROVIDER || 'openai';
  const key =
    env.TIMO_API_KEY ||
    env[
      (
        {
          openai: 'OPENAI_API_KEY',
          anthropic: 'ANTHROPIC_API_KEY',
          google: 'GEMINI_API_KEY',
          deepseek: 'DEEPSEEK_API_KEY',
        } as Record<string, string>
      )[provider]
    ];
  return {
    provider,
    model: env.TIMO_MODEL || '',
    key,
    baseUrl: env.TIMO_BASE_URL,
    protocol:
      env.TIMO_PROTOCOL === 'anthropic'
        ? ('anthropic' as const)
        : ('openai' as const),
  };
}
export function piGenerator(
  env: NodeJS.ProcessEnv = process.env,
): JsonGenerator {
  return piRuntime(env);
}
// Shared transport: vision adds actual Pi image blocks while text callers keep their API.
export function piRuntime(env: NodeJS.ProcessEnv, vision = false) {
  const config = modelConfig(env);
  const runOnce = async (
    system: string,
    user: string,
    signal?: AbortSignal,
    images?: ImageContent[],
    structuredSchema?: TSchema,
  ) => {
    if (!config.key || !config.model)
      throw new Error(
        'MODEL_NOT_CONFIGURED: 请配置 TIMO_MODEL 与 TIMO_API_KEY',
      );
    const credentials = new InMemoryCredentialStore();
    await credentials.modify(config.provider, async () => ({
      type: 'api_key',
      key: config.key!,
    }));
    const models = builtinModels({ credentials });
    let model: Model<Api> | undefined = models.getModel(
      config.provider,
      config.model,
    );
    if (config.baseUrl) {
      const url = new URL(config.baseUrl);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error('模型地址无效');
      const api =
        config.protocol === 'anthropic'
          ? 'anthropic-messages'
          : 'openai-completions';
      model = {
        id: config.model,
        name: config.model,
        provider: config.provider,
        api,
        baseUrl: config.baseUrl.replace(/\/$/, ''),
        reasoning: false,
        input: vision ? ['text', 'image'] : ['text'],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 12000,
      };
      models.setProvider(
        createProvider({
          id: config.provider,
          name: config.provider,
          baseUrl: model.baseUrl,
          auth: { apiKey: envApiKeyAuth('TimoTV model', ['TIMO_API_KEY']) },
          models: [model],
          api:
            config.protocol === 'anthropic'
              ? anthropicMessagesApi()
              : openAICompletionsApi(),
        }),
      );
    }
    if (!model)
      throw new Error(
        '未知模型，请检查 TIMO_PROVIDER / TIMO_MODEL；兼容接口请设置 TIMO_BASE_URL',
      );
    if (vision && !model.input.includes('image'))
      throw new Error('REVIEW_IMAGE_UNSUPPORTED');
    // DeepSeek enables high-effort thinking when no toggle is sent. Mark the
    // capability so Pi serializes an explicit OFF setting for these JSON jobs.
    const deepseek =
      config.protocol === 'openai' &&
      (config.provider === 'deepseek' ||
        new URL(model.baseUrl).hostname === 'api.deepseek.com');
    if (deepseek)
      model = {
        ...model,
        reasoning: true,
        compat: { ...model.compat, thinkingFormat: 'deepseek' },
      };
    let value: unknown,
      turns = 0,
      input = 0,
      output = 0;
    let stopReason: string | undefined;
    let providerError: string | undefined;
    let invalidSubmission = false;
    let timedOut = false;
    let turnLimitReached = false;
    const agent = new Agent({
      initialState: {
        systemPrompt: system,
        model,
        thinkingLevel: deepseek ? 'off' : 'low',
        tools: [
          {
            name: 'submit',
            label: '提交制作结果',
            description: structuredSchema
              ? '提交完整、符合参数约束的结构化制作结果。'
              : '提交符合要求的 JSON 对象；json 字段为序列化字符串。',
            parameters:
              structuredSchema ?? Type.Object({ json: Type.String() }),
            execute: async (_id, args) => {
              value = structuredSchema
                ? args
                : JSON.parse((args as { json: string }).json);
              return {
                content: [{ type: 'text' as const, text: '已接收' }],
                details: undefined,
                terminate: true,
              };
            },
          },
        ],
      },
      streamFn: models.streamSimple.bind(models),
      toolExecution: 'sequential',
    });
    agent.subscribe((e) => {
      if (e.type === 'turn_end') {
        // Pi may emit an extra abort error after our turn limit. Keep the actual last result.
        if (e.message.role === 'assistant' && !turnLimitReached) {
          stopReason = e.message.stopReason;
          providerError = e.message.errorMessage;
        }
        invalidSubmission ||= e.toolResults.some(
          (result) => result.toolName === 'submit' && result.isError,
        );
        const u = (e.message as any).usage;
        input += u?.input ?? 0;
        output += u?.output ?? 0;
        if (++turns >= 5) {
          turnLimitReached = true;
          agent.abort();
        }
      }
    });
    if (signal?.aborted) throw new Error('MODEL_CANCELLED');
    const abort = () => agent.abort();
    const timeout = setTimeout(() => {
      timedOut = true;
      abort();
    }, 180000);
    signal?.addEventListener('abort', abort, { once: true });
    try {
      try {
        await agent.prompt(user, images);
      } catch (error) {
        throw new Error(
          signal?.aborted
            ? 'MODEL_CANCELLED'
            : timedOut
              ? 'MODEL_TIMEOUT'
              : providerFailureCode(error),
        );
      }
      if (signal?.aborted) throw new Error('MODEL_CANCELLED');
      if (timedOut) throw new Error('MODEL_TIMEOUT');
      if (value === undefined) {
        if (stopReason === 'length') throw new Error('MODEL_OUTPUT_LIMIT');
        if (providerError || stopReason === 'error')
          throw new Error(providerFailureCode(providerError));
        if (invalidSubmission) throw new Error('MODEL_INVALID_SUBMISSION');
        throw new Error('MODEL_NO_SUBMISSION');
      }
      return { value, usage: { input, output } };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  };
  /** A provider stream can report a timeout after the request succeeded. Retry
   *  the whole prompt once for transient codes; deterministic failures surface. */
  const run = (
    system: string,
    user: string,
    signal?: AbortSignal,
    images?: ImageContent[],
    structuredSchema?: TSchema,
  ) =>
    withModelRetry(
      () => runOnce(system, user, signal, images, structuredSchema),
      signal,
    );
  return {
    generate(
      system: string,
      user: string,
      signal?: AbortSignal,
      images?: ImageContent[],
    ) {
      return run(system, user, signal, images);
    },
    generateStructured(
      system: string,
      user: string,
      schema: TSchema,
      signal?: AbortSignal,
    ) {
      return run(system, user, signal, undefined, schema);
    },
  };
}
