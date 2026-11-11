import { z } from 'zod';

import type { Production, WholeFilmIssue } from '@timotv/contracts';
import type { VisionGenerator } from './runtime/vision.js';

export interface WholeFilmReviewEvidence {
  sheet?: { mimeType: 'image/jpeg'; data: string };
  pages: { sceneId: string; timeMs: number; key: string }[];
  transitions: { from: string; to: string; timeMs: number; key: string }[];
}

const verdictSchema = z
  .object({
    pass: z.boolean(),
    issues: z
      .array(
        z
          .object({
            sceneId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
            atMs: z.number().int().nonnegative(),
            kind: z.enum(['continuity', 'visual', 'rhythm', 'runtime']),
            severity: z.enum(['error', 'warning']),
            what: z.string().trim().min(1).max(600),
            fix: z.string().trim().min(1).max(1000),
          })
          .strict(),
      )
      .max(12),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.pass !== (value.issues.length === 0))
      context.addIssue({
        code: 'custom',
        message: '全片结论与问题数量不一致',
      });
  });

const system = `你是整片视觉审片员。你会看到一张带页码和毫秒标签的接触表，其中包含每页稳定结束帧和相邻页切换帧。
只检查跨页一致性、视觉风格统一、主体身份连续、页面切换节奏和明显运行故障。逐页局部布局已经单独审过，不因个人审美偏好要求重画。
调用 submit：{pass:boolean,issues:[{sceneId,atMs,kind,severity,what,fix}]}。sceneId 和 atMs 必须属于输入时间线；通过时 issues 为空。`;

export async function reviewWholeFilm(
  production: Production,
  evidence: WholeFilmReviewEvidence,
  model: VisionGenerator,
  signal?: AbortSignal,
): Promise<{
  issues: WholeFilmIssue[];
  usage: { input: number; output: number };
}> {
  if (!evidence.sheet?.data)
    throw new Error('WHOLE_FILM_REVIEW_IMAGES_REQUIRED');
  const result = await model.generate(
    system,
    JSON.stringify({
      title: production.storyboard?.title ?? production.brief.topic,
      aspectRatio: production.aspectRatio,
      style: production.visual?.style ?? production.brief.style,
      pages: production.scenes.map((scene) => ({
        sceneId: scene.id,
        title: scene.title,
        visual: scene.visual,
        beats: scene.beats,
        startMs: scene.cues[0]?.startMs,
        endMs: scene.cues.at(-1)?.endMs,
      })),
      evidence: {
        pages: evidence.pages,
        transitions: evidence.transitions,
      },
    }),
    [evidence.sheet],
    signal,
  );
  const verdict = verdictSchema.safeParse(result.value);
  if (!verdict.success) throw new Error('WHOLE_FILM_REVIEW_INVALID');
  const scenes = new Map(production.scenes.map((scene) => [scene.id, scene]));
  if (
    verdict.data.issues.some((issue) => {
      const scene = scenes.get(issue.sceneId);
      return (
        !scene ||
        issue.atMs < scene.cues[0]!.startMs! ||
        issue.atMs >= scene.cues.at(-1)!.endMs!
      );
    })
  )
    throw new Error('WHOLE_FILM_REVIEW_INVALID');
  return {
    issues: verdict.data.issues.map(({ sceneId, ...issue }) => ({
      ...issue,
      sceneIds: [sceneId],
      elementIds: [],
    })),
    usage: result.usage,
  };
}
