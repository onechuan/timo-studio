export interface AppSettings {
  revision: number;
  production: {
    videoPipeline: VideoPipeline;
  };
  model: {
    provider: string;
    model: string;
    baseUrl: string;
    protocol: 'openai' | 'anthropic';
    apiKeyConfigured: boolean;
  };
  reviewer?: AppSettings['model'] & { enabled: boolean };
  speech: {
    volcengine: {
      apiKeyConfigured: boolean;
      voice: string;
      resourceId: string;
    };
    elevenlabs: { apiKeyConfigured: boolean; voice: string };
  };
}
export interface SettingsUpdate {
  revision: number;
  production?: {
    videoPipeline?: VideoPipeline;
  };
  model?: {
    provider?: string;
    model?: string;
    baseUrl?: string;
    protocol?: 'openai' | 'anthropic';
    apiKey?: string | null;
  };
  reviewer?: SettingsUpdate['model'] & { enabled?: boolean };
  speech?: {
    volcengine?: {
      apiKey?: string | null;
      voice?: string;
      resourceId?: string;
    };
    elevenlabs?: { apiKey?: string | null; voice?: string };
  };
}
export const videoPipelineValues = ['legacy-v3', 'drawing-engine-v3'] as const;
export type VideoPipeline = (typeof videoPipelineValues)[number];
/** Returns a supported pipeline, or undefined for retired/unknown persisted values. */
export function normalizeVideoPipeline(
  value: unknown,
): VideoPipeline | undefined {
  return videoPipelineValues.find((pipeline) => pipeline === value);
}
export function resolveVideoPipeline(
  configured: VideoPipeline | string | undefined,
  env: { TIMOTV_VIDEO_PIPELINE?: string },
): VideoPipeline {
  return (
    normalizeVideoPipeline(env.TIMOTV_VIDEO_PIPELINE) ??
    normalizeVideoPipeline(configured) ??
    'legacy-v3'
  );
}
export interface VoiceDefinition {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: 'zh' | 'en';
  resourceId: string;
}
export const VOLCENGINE_VOICES_SOURCE =
  'https://docs.volcengine.com/docs/doubao-voice/tone-list-3?lang=zh';
export const VOLCENGINE_VOICES: VoiceDefinition[] = [
  {
    name: '渊博小叔 2.0',
    id: 'zh_male_yuanboxiaoshu_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '云舟 2.0',
    id: 'zh_male_m191_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '解说小明 2.0',
    id: 'zh_male_jieshuoxiaoming_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '儒雅逸辰 2.0',
    id: 'zh_male_ruyayichen_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '磁性解说男声 2.0',
    id: 'zh_male_cixingjieshuonan_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '深夜播客 2.0',
    id: 'zh_male_shenyeboke_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '阳光青年 2.0',
    id: 'zh_male_yangguangqingnian_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '温暖阿虎 2.0',
    id: 'zh_male_wennuanahu_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '悬疑解说 2.0',
    id: 'zh_male_xuanyijieshuo_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '小天 2.0',
    id: 'zh_male_taocheng_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '少年梓辛 2.0',
    id: 'zh_male_shaonianzixin_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '广告解说 2.0',
    id: 'zh_male_guanggaojieshuo_uranus_bigtts',
    gender: 'male',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: 'Vivi 2.0',
    id: 'zh_female_vv_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '小何 2.0',
    id: 'zh_female_xiaohe_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '知性灿灿 2.0',
    id: 'zh_female_cancan_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '清新女声 2.0',
    id: 'zh_female_qingxinnvsheng_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '甜美小源 2.0',
    id: 'zh_female_tianmeixiaoyuan_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '爽快思思 2.0',
    id: 'zh_female_shuangkuaisisi_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '温柔淑女 2.0',
    id: 'zh_female_wenroushunv_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '亲切女声 2.0',
    id: 'zh_female_qinqienv_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '知性女声 2.0',
    id: 'zh_female_zhixingnv_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '温柔妈妈 2.0',
    id: 'zh_female_wenroumama_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: 'Tina老师 2.0',
    id: 'zh_female_yingyujiaoxue_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: '清澈梓梓 2.0',
    id: 'zh_female_qingchezizi_uranus_bigtts',
    gender: 'female',
    language: 'zh',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: 'Tim',
    id: 'en_male_tim_uranus_bigtts',
    gender: 'male',
    language: 'en',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: 'Dacey',
    id: 'en_female_dacey_uranus_bigtts',
    gender: 'female',
    language: 'en',
    resourceId: 'seed-tts-2.0',
  },
  {
    name: 'Stokie',
    id: 'en_female_stokie_uranus_bigtts',
    gender: 'female',
    language: 'en',
    resourceId: 'seed-tts-2.0',
  },
];

import { z } from 'zod';
const settingsText = z
  .string()
  .max(120)
  .refine((v) => !/[\r\n\0]/.test(v));
const settingsSecret = z
  .string()
  .refine((v) => !/[\r\n\0]/.test(v))
  .transform((v) => v.trim())
  .pipe(z.string().max(4096))
  .nullable();
const settingsUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return (
        ['http:', 'https:'].includes(u.protocol) &&
        !u.username &&
        !u.password &&
        !u.search &&
        !u.hash
      );
    } catch {
      return false;
    }
  });
const modelSettingsSchema = z
  .object({
    provider: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,120}$/)
      .optional(),
    model: settingsText.optional(),
    baseUrl: settingsUrl.optional(),
    protocol: z.enum(['openai', 'anthropic']).optional(),
    apiKey: settingsSecret.optional(),
  })
  .strict();
const reviewerSettingsSchema = modelSettingsSchema.extend({
  enabled: z.boolean().optional(),
});
const volcSettingsSchema = z
  .object({
    apiKey: settingsSecret.optional(),
    voice: z
      .string()
      .max(120)
      .regex(/^[A-Za-z0-9_-]*$/)
      .optional(),
    resourceId: settingsText.optional(),
  })
  .strict();
const elevenSettingsSchema = z
  .object({ apiKey: settingsSecret.optional(), voice: settingsText.optional() })
  .strict();
const videoPipelineSchema = z.enum(videoPipelineValues).default('legacy-v3');
const persistedVideoPipelineSchema = z.preprocess(
  (value) => normalizeVideoPipeline(value) ?? 'legacy-v3',
  z.enum(videoPipelineValues).default('legacy-v3'),
);
export const productionSettingsSchema = z
  .object({
    videoPipeline: videoPipelineSchema,
  })
  .strict();
const persistedProductionSettingsSchema = z
  .object({
    videoPipeline: persistedVideoPipelineSchema,
  })
  .strict();
export const settingsSchema = z
  .object({
    production: productionSettingsSchema.default({}),
  })
  .strict();
export const settingsUpdateSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    production: productionSettingsSchema.partial().strict().optional(),
    model: modelSettingsSchema.optional(),
    reviewer: reviewerSettingsSchema.optional(),
    speech: z
      .object({
        volcengine: volcSettingsSchema.optional(),
        elevenlabs: elevenSettingsSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export const privateSettingsSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    production: persistedProductionSettingsSchema.default({}),
    model: modelSettingsSchema,
    reviewer: reviewerSettingsSchema.optional(),
    speech: z
      .object({
        volcengine: volcSettingsSchema,
        elevenlabs: elevenSettingsSchema,
      })
      .strict(),
  })
  .strict();
