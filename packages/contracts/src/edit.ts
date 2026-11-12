import { z } from 'zod';
import type { Production } from './production.js';

/** The renderer captures whole frames at this constant rate. */
export const GENERATED_FILM_FPS = 12;
const clipId = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/);
const frameMs = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const editClipSchema = z
  .object({
    id: clipId,
    sourceInMs: frameMs,
    sourceOutMs: frameMs,
    volume: z.number().min(0).max(2).default(1),
    muted: z.boolean().default(false),
  })
  .strict()
  .refine((clip) => clip.sourceOutMs > clip.sourceInMs, '出点必须晚于入点');
export type EditClip = z.infer<typeof editClipSchema>;

export const productionEditInputSchema = z
  .object({ clips: z.array(editClipSchema).min(1).max(200) })
  .strict();
export type ProductionEditInput = z.infer<typeof productionEditInputSchema>;

export const editSourceCueSchema = z
  .object({
    id: z.string().min(1).max(80),
    text: z.string().min(1).max(2000),
    startMs: frameMs,
    endMs: frameMs,
  })
  .strict()
  .refine((cue) => cue.endMs > cue.startMs, '字幕结束时间必须大于开始时间');
export type EditSourceCue = z.infer<typeof editSourceCueSchema>;

export const editSourceSchema = z
  .object({
    videoKey: z.string().min(1),
    durationMs: z.number().int().positive(),
    fps: z.number().int().min(1).max(120),
    cues: z.array(editSourceCueSchema).max(2000),
  })
  .strict();
export type EditSource = z.infer<typeof editSourceSchema>;

export const editDerivedClipSchema = z
  .object({
    id: clipId,
    sourceInMs: frameMs,
    sourceOutMs: frameMs,
    timelineStartMs: frameMs,
    durationMs: z.number().int().positive(),
    volume: z.number().min(0).max(2),
    muted: z.boolean(),
  })
  .strict();
export type EditDerivedClip = z.infer<typeof editDerivedClipSchema>;

export const editSubtitleSchema = z
  .object({
    cueId: z.string().min(1).max(80),
    text: z.string().min(1).max(2000),
    startMs: frameMs,
    endMs: frameMs,
  })
  .strict()
  .refine((cue) => cue.endMs > cue.startMs, '字幕结束时间必须大于开始时间');
export type EditSubtitle = z.infer<typeof editSubtitleSchema>;

export const editOutputSchema = z
  .object({
    videoKey: z.string().min(1),
    subtitlesKey: z.string().min(1),
    durationMs: z.number().int().nonnegative(),
    exportedAt: z.string(),
  })
  .strict();
export type EditOutput = z.infer<typeof editOutputSchema>;

export const productionEditSchema = z
  .object({
    source: editSourceSchema,
    clips: z.array(editDerivedClipSchema).min(1).max(200),
    subtitles: z.array(editSubtitleSchema).max(2000),
    output: editOutputSchema.optional(),
  })
  .strict();
export type ProductionEdit = z.infer<typeof productionEditSchema>;

export interface EditTimeline {
  clips: EditDerivedClip[];
  subtitles: EditSubtitle[];
  durationMs: number;
}

const frameToMs = (frame: number, fps: number) =>
  Math.round((frame * 1000) / fps);
const msToFrame = (ms: number, fps: number) => Math.round((ms * fps) / 1000);

export function sourceFrameCount(source: EditSource) {
  return Math.ceil((source.durationMs * source.fps) / 1000);
}

/**
 * Snap clip boundaries to captured frames, lay them out in output order, and
 * remap subtitles onto the edited timeline. The timeline is the single source
 * of truth for both the UI and FFmpeg.
 */
export function deriveEditTimeline(
  source: EditSource,
  clips: EditClip[],
): EditTimeline {
  if (!clips.length) throw new Error('至少保留一个剪辑片段');
  const totalFrames = sourceFrameCount(source);
  const seen = new Set<string>();
  let cursor = 0;
  const derived: EditDerivedClip[] = [];
  for (const clip of clips) {
    if (seen.has(clip.id)) throw new Error(`剪辑片段 ID 重复：${clip.id}`);
    seen.add(clip.id);
    const inFrame = msToFrame(clip.sourceInMs, source.fps);
    const outFrame = msToFrame(clip.sourceOutMs, source.fps);
    if (outFrame <= inFrame)
      throw new Error(`剪辑片段 ${clip.id} 的入点必须早于出点`);
    if (inFrame < 0 || outFrame > totalFrames)
      throw new Error(`剪辑片段 ${clip.id} 超出原片范围`);
    const durationMs = frameToMs(outFrame - inFrame, source.fps);
    derived.push({
      id: clip.id,
      sourceInMs: frameToMs(inFrame, source.fps),
      sourceOutMs: frameToMs(outFrame, source.fps),
      timelineStartMs: frameToMs(cursor, source.fps),
      durationMs,
      volume: clip.volume,
      muted: clip.muted,
    });
    cursor += outFrame - inFrame;
  }

  const subtitles: EditSubtitle[] = [];
  for (const clip of derived) {
    for (const cue of source.cues) {
      const startMs = Math.max(cue.startMs, clip.sourceInMs);
      const endMs = Math.min(cue.endMs, clip.sourceOutMs);
      if (endMs <= startMs) continue;
      const mapped: EditSubtitle = {
        cueId: cue.id,
        text: cue.text,
        startMs: clip.timelineStartMs + startMs - clip.sourceInMs,
        endMs: clip.timelineStartMs + endMs - clip.sourceInMs,
      };
      const previous = subtitles[subtitles.length - 1];
      // A cue cut by a join whose source stays contiguous is still one subtitle.
      if (
        previous &&
        previous.cueId === mapped.cueId &&
        previous.text === mapped.text &&
        previous.endMs === mapped.startMs
      )
        previous.endMs = mapped.endMs;
      else subtitles.push(mapped);
    }
  }
  subtitles.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  return {
    clips: derived,
    subtitles,
    durationMs: frameToMs(cursor, source.fps),
  };
}

/** Map an output-timeline position back to a clip and source timestamp. */
export function locateEditClip(timeline: EditTimeline, outputMs: number) {
  const clips = timeline.clips;
  if (!clips.length) throw new Error('剪辑结果为空');
  const ms = Math.min(
    Math.max(outputMs, 0),
    Math.max(timeline.durationMs - 1, 0),
  );
  const found = clips.findIndex(
    (clip) =>
      ms >= clip.timelineStartMs && ms < clip.timelineStartMs + clip.durationMs,
  );
  const index = found >= 0 ? found : clips.length - 1;
  const clip = clips[index]!;
  const offset = Math.min(
    Math.max(ms - clip.timelineStartMs, 0),
    clip.durationMs,
  );
  return { index, clip, sourceMs: clip.sourceInMs + offset };
}

export function flattenEditCues(production: Production): EditSourceCue[] {
  return production.scenes.flatMap((scene) =>
    scene.cues.flatMap((cue) =>
      cue.startMs !== undefined && cue.endMs !== undefined
        ? [
            {
              id: cue.id,
              text: cue.text,
              startMs: cue.startMs,
              endMs: cue.endMs,
            },
          ]
        : [],
    ),
  );
}

export function buildEditSource(production: Production): EditSource {
  if (!production.artifacts.video || !production.durationMs)
    throw new Error('请先导出视频，再进行剪辑');
  return {
    videoKey: production.artifacts.video,
    durationMs: production.durationMs,
    fps: GENERATED_FILM_FPS,
    cues: flattenEditCues(production),
  };
}

/** Export and edit-export reuse a revision, so freshness compares source snapshots. */
export function isEditCurrent(production: Production): boolean {
  const edit = production.edit;
  if (!edit) return false;
  if (
    edit.source.fps !== GENERATED_FILM_FPS ||
    edit.source.videoKey !== production.artifacts.video ||
    edit.source.durationMs !== production.durationMs
  )
    return false;
  const cues = flattenEditCues(production);
  // PostgreSQL jsonb does not preserve object key order, so compare values
  // field by field instead of serializing the cue objects.
  return (
    edit.source.cues.length === cues.length &&
    edit.source.cues.every((cue, index) => {
      const current = cues[index]!;
      return (
        cue.id === current.id &&
        cue.text === current.text &&
        cue.startMs === current.startMs &&
        cue.endMs === current.endMs
      );
    })
  );
}

/**
 * Initial cut points follow scene starts so deleting or reordering a scene is
 * one timeline operation. Clips stay contiguous and cover the whole film.
 */
export function defaultEditClips(production: Production): EditClip[] {
  const durationMs = production.durationMs;
  if (!durationMs || durationMs <= 0 || !production.scenes.length) return [];
  const fps = GENERATED_FILM_FPS;
  const totalFrames = Math.ceil((durationMs * fps) / 1000);
  if (totalFrames < 1) return [];
  const boundaries = [0];
  for (const scene of production.scenes.slice(1)) {
    const startMs = scene.cues.reduce<number | undefined>(
      (min, cue) =>
        cue.startMs === undefined
          ? min
          : min === undefined
            ? cue.startMs
            : Math.min(min, cue.startMs),
      undefined,
    );
    if (startMs === undefined) return singleClip(totalFrames, fps);
    const frame = Math.min(Math.max(msToFrame(startMs, fps), 0), totalFrames);
    const previous = boundaries[boundaries.length - 1]!;
    if (frame > previous && frame < totalFrames) boundaries.push(frame);
  }
  boundaries.push(totalFrames);
  if (boundaries.length < 3) return singleClip(totalFrames, fps);
  return boundaries.slice(0, -1).map((frame, index) => ({
    id: `clip-${index + 1}`,
    sourceInMs: frameToMs(frame, fps),
    sourceOutMs: frameToMs(boundaries[index + 1]!, fps),
    volume: 1,
    muted: false,
  }));
}

function singleClip(totalFrames: number, fps: number): EditClip[] {
  return [
    {
      id: 'clip-1',
      sourceInMs: 0,
      sourceOutMs: frameToMs(totalFrames, fps),
      volume: 1,
      muted: false,
    },
  ];
}
