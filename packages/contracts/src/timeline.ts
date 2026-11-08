import { z } from 'zod';
import { aspectRatioSchema } from './project.js';
const ms = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const base = {
  id: z.string().uuid(),
  assetId: z.string().uuid(),
  timelineStartMs: ms,
};
const source = {
  sourceInMs: ms,
  sourceOutMs: ms,
  volume: z.number().min(0).max(2),
};
const video = z
  .object({ ...base, ...source, kind: z.literal('video') })
  .strict();
const image = z
  .object({ ...base, kind: z.literal('image'), durationMs: ms.positive() })
  .strict();
const audio = z
  .object({ ...base, ...source, kind: z.literal('audio') })
  .strict();
export const timelineSchema = z
  .object({
    schemaVersion: z.literal(1),
    projectId: z.string().uuid(),
    revision: ms,
    aspectRatio: aspectRatioSchema,
    fps: z.number().int().min(1).max(120),
    videoClips: z
      .array(z.discriminatedUnion('kind', [video, image]))
      .max(10000),
    audioClips: z.array(audio).max(10000),
    subtitles: z
      .array(
        z
          .object({
            id: z.string().uuid(),
            startMs: ms,
            endMs: ms,
            text: z.string().trim().min(1).max(5000),
          })
          .strict(),
      )
      .max(10000),
  })
  .strict()
  .superRefine((t, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
    const ids = [...t.videoClips, ...t.audioClips, ...t.subtitles].map(
      (c) => c.id,
    );
    if (new Set(ids).size !== ids.length) fail('片段 ID 不得重复');
    let end = 0;
    for (const c of t.videoClips) {
      const duration =
        c.kind === 'image' ? c.durationMs : c.sourceOutMs - c.sourceInMs;
      if (duration <= 0) fail('素材出点必须大于入点');
      if (c.timelineStartMs < end) fail('顺序视频轨不得重叠或乱序');
      end = c.timelineStartMs + duration;
      if (!Number.isSafeInteger(end)) fail('时间超出安全整数范围');
    }
    for (const c of t.audioClips) {
      if (c.sourceOutMs <= c.sourceInMs) fail('音频出点必须大于入点');
      if (
        !Number.isSafeInteger(c.timelineStartMs + c.sourceOutMs - c.sourceInMs)
      )
        fail('时间超出安全整数范围');
    }
    let subtitleEnd = 0;
    for (const s of t.subtitles) {
      if (s.endMs <= s.startMs) fail('字幕结束时间必须大于开始时间');
      if (s.startMs < subtitleEnd) fail('字幕轨不得重叠或乱序');
      subtitleEnd = s.endMs;
    }
  });
export type Timeline = z.infer<typeof timelineSchema>;
export const emptyTimeline = (
  projectId: string,
  aspectRatio: Timeline['aspectRatio'],
): Timeline => ({
  schemaVersion: 1,
  projectId,
  revision: 0,
  aspectRatio,
  fps: 30,
  videoClips: [],
  audioClips: [],
  subtitles: [],
});
