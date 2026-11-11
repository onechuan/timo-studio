import { z } from 'zod';
import {
  drawingStyleSchema,
  filmKitItemSchema,
  filmKitStateSchema,
  isLegacyArtwork,
  sceneLayoutSchema,
  sceneArtworkSchema,
} from './artwork.js';
import { wholeFilmReviewSchema, type SceneReview } from './review.js';
import type { ProductionFailure } from './production-failure.js';
const text = z.string().trim().min(1);
const id = text.max(80).regex(/^[a-zA-Z0-9_-]+$/);
export const contentTypeSchema = z.enum(['general', 'explainer', 'product']);
export type ContentType = z.infer<typeof contentTypeSchema>;
export const contentTypeLabels: Record<ContentType, string> = {
  general: '通用讲解',
  explainer: '科普口播',
  product: '产品介绍',
};
export const productionBriefSchema = z
  .object({
    topic: z.string().trim().max(4000).default(''),
    materials: z.string().trim().max(60000).default(''),
    // Persisted briefs from before content directions omit this field.
    contentType: contentTypeSchema.optional(),
    durationSec: z.number().int().min(15).max(600).default(60),
    language: z.enum(['zh', 'en']).default('zh'),
    style: z.enum(['warm', 'chalk', 'tech', 'brand']).default('warm'),
    voiceProvider: z
      .enum(['volcengine', 'local', 'elevenlabs'])
      .default('volcengine'),
    voice: z.string().trim().max(120).default(''),
  })
  .refine(
    (v) => !!(v.topic || v.materials),
    '请输入想讲的主题，或附上文本资料',
  );
export type ProductionBrief = z.infer<typeof productionBriefSchema>;
const planned = z.object({
  id,
  title: text.max(100),
  say: text.max(2000),
  visual: text.max(2000),
  layout: sceneLayoutSchema.optional(),
  beats: z.array(text.max(500)).min(1).max(20),
});
export const storyboardPlanSchema = z
  .object({
    title: text.max(120),
    summary: text.max(1000),
    kit: z.array(filmKitItemSchema).max(3).optional(),
    scenes: z.array(planned).min(1).max(30),
  })
  .superRefine((v, c) => {
    if (new Set(v.scenes.map((s) => s.id)).size !== v.scenes.length)
      c.addIssue({ code: 'custom', message: '场景 ID 重复' });
  });
export type StoryboardPlan = z.infer<typeof storyboardPlanSchema>;
export const cueSchema = z
  .object({
    id,
    text: text.max(500),
    audioKey: z.string().optional(),
    startMs: z.number().int().nonnegative().optional(),
    endMs: z.number().int().nonnegative().optional(),
  })
  .superRefine((v, c) => {
    if (
      (v.startMs === undefined) !== (v.endMs === undefined) ||
      (v.startMs !== undefined && v.endMs! <= v.startMs)
    )
      c.addIssue({ code: 'custom', message: '口播时间范围无效' });
  });
export const sceneSchema = z
  .object({
    id,
    title: text.max(100),
    visual: text.max(2000),
    layout: sceneLayoutSchema.optional(),
    artwork: sceneArtworkSchema.optional(),
    beats: z.array(text.max(500)).min(1).max(20),
    cues: z.array(cueSchema).min(1).max(40),
  })
  .superRefine((scene, ctx) => {
    if (
      isLegacyArtwork(scene.artwork) &&
      scene.artwork.elements.some((e) => e.cueIndex >= scene.cues.length)
    )
      ctx.addIssue({ code: 'custom', message: '绘图对象引用了不存在的口播句' });
  });
export const scriptScenesSchema = z
  .array(sceneSchema)
  .min(1)
  .max(30)
  .superRefine((v, c) => {
    const ids = v.flatMap((s) => [s.id, ...s.cues.map((q) => q.id)]);
    if (new Set(ids).size !== ids.length)
      c.addIssue({ code: 'custom', message: '场景或口播 ID 重复' });
  });
export type FilmScene = z.infer<typeof sceneSchema> & { review?: SceneReview };
export type FilmCue = z.infer<typeof cueSchema>;
export const productionStageSchema = z.enum([
  'draft',
  'planning',
  'approval',
  'scripting',
  'narrating',
  'illustrating',
  'composing',
  'ready',
  'rendering',
  'failed',
]);
export type ProductionStage = z.infer<typeof productionStageSchema>;
export const filmVisualStateSchema = z
  .object({
    upstreamRevision: z.string().regex(/^[a-f0-9]{40}$/),
    engineRevision: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    style: drawingStyleSchema,
    filmKit: filmKitStateSchema.optional(),
    wholeFilmReview: wholeFilmReviewSchema.optional(),
  })
  .strict();
export type FilmVisualState = z.infer<typeof filmVisualStateSchema>;
export interface Production {
  aspectRatio: '16:9' | '9:16';
  projectId: string;
  revision: number;
  stage: ProductionStage;
  brief: ProductionBrief;
  storyboard?: StoryboardPlan;
  scenes: FilmScene[];
  durationMs?: number;
  visual?: FilmVisualState;
  timingSource?: 'audio-per-cue';
  artifacts: {
    preview?: string;
    audio?: string;
    subtitles?: string;
    video?: string;
  };
  jobId?: string;
  failure?: ProductionFailure;
  error?: string;
  failedAction?: 'plan' | 'produce' | 'illustrate' | 'export';
  reviewTask?: { sceneId: string; mode: 'review' | 'repair' | 'illustrate' };
  events: { at: string; message: string }[];
  usage?: { input: number; output: number };
}
export const productionActionSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    action: z.enum([
      'plan',
      'approve',
      'produce',
      'illustrate',
      'export',
      'review',
      'repair',
      'accept',
    ]),
    feedback: z.string().trim().max(4000).optional(),
    restart: z.boolean().optional(),
    sceneId: id.optional(),
  })
  .strict()
  .refine(
    (v) => v.restart === undefined || v.action === 'illustrate',
    '仅绘图任务支持重新绘制全部画面',
  )
  .refine(
    (v) =>
      !v.sceneId ||
      (['illustrate', 'review', 'repair', 'accept'].includes(v.action) &&
        !v.restart),
    '单页重绘只用于绘图，不能同时重绘全部画面',
  )
  .refine(
    (v) => !['review', 'repair', 'accept'].includes(v.action) || !!v.sceneId,
    '请选择需要检查的分镜页',
  );
export type ProductionAction = z.infer<typeof productionActionSchema>;
export const activeProductionStages: ProductionStage[] = [
  'planning',
  'scripting',
  'narrating',
  'illustrating',
  'composing',
  'rendering',
];
export interface ProductionCapabilities {
  model: { configured: boolean; provider: string; model: string };
  voices: { volcengine: boolean; local: boolean; elevenlabs: boolean };
}
export const productionUpdateSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    brief: productionBriefSchema.optional(),
    storyboard: storyboardPlanSchema.optional(),
    scenes: scriptScenesSchema.optional(),
  })
  .strict()
  .refine((v) => !!(v.brief || v.storyboard || v.scenes), '没有需要保存的内容');
