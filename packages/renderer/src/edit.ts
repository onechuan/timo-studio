import { access, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import ffmpeg from 'ffmpeg-static';
import {
  deriveEditTimeline,
  isEditCurrent,
  type EditSubtitle,
  type EditTimeline,
  type Production,
} from '@timotv/contracts';

export interface EditFilmInput {
  production: Production;
  root: string;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
}

/** Match the SRT writer used for narration so downloaded subtitle styles agree. */
export function toEditSrt(subtitles: EditSubtitle[]) {
  const stamp = (n: number) =>
    new Date(n).toISOString().slice(11, 23).replace('.', ',');
  return subtitles
    .map(
      (cue, index) =>
        `${index + 1}\n${stamp(cue.startMs)} --> ${stamp(cue.endMs)}\n${cue.text}\n`,
    )
    .join('\n');
}

function prefix(p: Production) {
  if (
    !/^[\w-]+$/.test(p.projectId) ||
    !Number.isInteger(p.revision) ||
    p.revision < 0
  )
    throw new Error('Invalid identity');
  return `production/${p.projectId}/r${p.revision}`;
}

/**
 * Single-pass filter graph: trim by frame, pad/truncate each audio segment to
 * the exact segment duration, then concatenate once. Stream-copy concatenation
 * of per-clip MP4s drifts at every join because AAC priming samples are not
 * sample-accurate.
 */
export function buildEditFilter(timeline: EditTimeline, fps: number) {
  const parts: string[] = [];
  timeline.clips.forEach((clip, index) => {
    const startFrame = Math.round((clip.sourceInMs * fps) / 1000);
    const endFrame = Math.round((clip.sourceOutMs * fps) / 1000);
    const seconds = (endFrame - startFrame) / fps;
    const gain = clip.muted ? 0 : clip.volume;
    parts.push(
      `[0:v]trim=start_frame=${startFrame}:end_frame=${endFrame},setpts=PTS-STARTPTS[v${index}]`,
    );
    parts.push(
      `[0:a]atrim=start=${(startFrame / fps).toFixed(6)}:end=${(endFrame / fps).toFixed(6)},` +
        `asetpts=PTS-STARTPTS,volume=${gain},apad,atrim=end=${seconds.toFixed(6)},` +
        `asetpts=PTS-STARTPTS[a${index}]`,
    );
  });
  const inputs = timeline.clips
    .map((_, index) => `[v${index}][a${index}]`)
    .join('');
  parts.push(`${inputs}concat=n=${timeline.clips.length}:v=1:a=1[vout][aout]`);
  return parts.join(';');
}

export function buildEditFfmpegArgs(
  timeline: EditTimeline,
  fps: number,
  sourcePath: string,
  outputPath: string,
  filterScriptPath?: string,
) {
  const totalFrames = timeline.clips.reduce(
    (sum, clip) =>
      sum +
      Math.round((clip.sourceOutMs * fps) / 1000) -
      Math.round((clip.sourceInMs * fps) / 1000),
    0,
  );
  const totalSeconds = (totalFrames / fps).toFixed(6);
  const filter = buildEditFilter(timeline, fps);
  return [
    '-y',
    '-nostdin',
    '-i',
    sourcePath,
    ...(filterScriptPath
      ? ['-filter_complex_script', filterScriptPath]
      : ['-filter_complex', filter]),
    '-map',
    '[vout]',
    '-map',
    '[aout]',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(fps),
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-t',
    totalSeconds,
    '-movflags',
    '+faststart',
    outputPath,
  ];
}

function runFfmpeg(args: string[], signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.env.FFMPEG_PATH || (ffmpeg as unknown as string),
      args,
      { signal },
    );
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-4000);
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`剪辑导出失败：${stderr || `ffmpeg ${code}`}`)),
    );
  });
}

export async function renderEditedFilm({
  production,
  root,
  signal,
  onProgress,
}: EditFilmInput): Promise<Production> {
  signal?.throwIfAborted();
  const edit = production.edit;
  if (!edit) throw new Error('缺少剪辑内容');
  if (!isEditCurrent(production))
    throw new Error('原片已变化，请重新保存剪辑后再导出');
  const timeline = deriveEditTimeline(edit.source, edit.clips);
  if (!timeline.durationMs) throw new Error('剪辑结果为空');
  const fps = edit.source.fps;
  const base = prefix(production);
  const directory = join(root, base);
  await mkdir(directory, { recursive: true });

  const videoKey = `${base}/edit.mp4`;
  const subtitlesKey = `${base}/edit.srt`;
  const pendingVideo = join(directory, `edit-${randomUUID()}.tmp.mp4`);
  const pendingSrt = join(directory, `edit-${randomUUID()}.tmp.srt`);
  const filterScript =
    timeline.clips.length > 100
      ? join(directory, `edit-${randomUUID()}.filter.txt`)
      : undefined;
  try {
    onProgress?.('正在裁剪、重排并混音片段');
    await writeFile(pendingSrt, toEditSrt(timeline.subtitles), 'utf8');
    const filter = buildEditFilter(timeline, fps);
    if (filterScript) await writeFile(filterScript, filter, 'utf8');
    await runFfmpeg(
      buildEditFfmpegArgs(
        timeline,
        fps,
        join(root, edit.source.videoKey),
        pendingVideo,
        filterScript,
      ),
      signal,
    );
    signal?.throwIfAborted();
    await access(pendingVideo);
    await rename(pendingVideo, join(root, videoKey));
    await rename(pendingSrt, join(root, subtitlesKey));
    return {
      ...production,
      edit: {
        ...edit,
        output: {
          videoKey,
          subtitlesKey,
          durationMs: timeline.durationMs,
          exportedAt: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    await rm(pendingVideo, { force: true }).catch(() => {});
    await rm(pendingSrt, { force: true }).catch(() => {});
    throw error;
  } finally {
    if (filterScript) await rm(filterScript, { force: true }).catch(() => {});
  }
}
