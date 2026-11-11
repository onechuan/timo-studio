import { createHash } from 'node:crypto';
import { piRuntime } from './pi.js';
export interface VisionImage {
  mimeType: string;
  data: string;
}
export interface VisionGenerator {
  generate(
    system: string,
    user: string,
    images: VisionImage[],
    signal?: AbortSignal,
  ): Promise<{ value: unknown; usage: { input: number; output: number } }>;
}
export function reviewModelConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    enabled: env.TIMO_REVIEW_ENABLED === 'true',
    configured: !!(env.TIMO_REVIEW_MODEL && env.TIMO_REVIEW_API_KEY),
    provider: env.TIMO_REVIEW_PROVIDER || 'openai',
    model: env.TIMO_REVIEW_MODEL || '',
    protocol:
      env.TIMO_REVIEW_PROTOCOL === 'anthropic'
        ? ('anthropic' as const)
        : ('openai' as const),
    baseUrl: env.TIMO_REVIEW_BASE_URL || '',
    revision:
      env.TIMO_REVIEW_REVISION ||
      createHash('sha256')
        .update(
          JSON.stringify([
            env.TIMO_REVIEW_ENABLED,
            env.TIMO_REVIEW_PROVIDER,
            env.TIMO_REVIEW_MODEL,
            env.TIMO_REVIEW_PROTOCOL,
            env.TIMO_REVIEW_BASE_URL,
            env.TIMO_REVIEW_API_KEY,
          ]),
        )
        .digest('hex'),
  };
}
export function piVisionGenerator(
  env: NodeJS.ProcessEnv = process.env,
): VisionGenerator {
  const config = reviewModelConfig(env);
  // Explicit allowlist prevents any director/provider credential fallback.
  const runtime = piRuntime(
    {
      TIMO_PROVIDER: config.provider,
      TIMO_MODEL: config.model,
      TIMO_PROTOCOL: config.protocol,
      TIMO_BASE_URL: config.baseUrl,
      TIMO_API_KEY: env.TIMO_REVIEW_API_KEY,
    },
    true,
  );
  return {
    async generate(system, user, images, signal) {
      if (!config.enabled || !config.configured)
        throw new Error('REVIEW_NOT_CONFIGURED');
      if (!images.length || images.length > 24)
        throw new Error('REVIEW_IMAGES_REQUIRED');
      if (
        images.some(
          (image) =>
            !['image/png', 'image/jpeg', 'image/webp'].includes(
              image.mimeType,
            ) ||
            !image.data ||
            image.data.length > 16_000_000 ||
            !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data),
        )
      )
        throw new Error('REVIEW_IMAGES_INVALID');
      return runtime.generate(
        system,
        user,
        signal,
        images.map((image) => ({ type: 'image' as const, ...image })),
      );
    },
  };
}
