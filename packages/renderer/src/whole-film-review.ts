import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { lstat, mkdir, readFile, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';

import type { Production } from '@timotv/contracts';
import ffmpeg from 'ffmpeg-static';

import { createBrowserRuntime } from './browser-runtime.js';
import { validateFilmTiming } from './preview.js';

export const WHOLE_FILM_REVIEW_VERSION = 'whole-film-review-1.0';

export interface WholeFilmEvidenceFrame {
  sceneId: string;
  timeMs: number;
  key: string;
}

export interface WholeFilmTransitionFrame {
  from: string;
  to: string;
  timeMs: number;
  key: string;
}

export interface WholeFilmEvidence {
  fingerprint: string;
  sheetKey: string;
  sheet?: { mimeType: 'image/jpeg'; data: string };
  pages: WholeFilmEvidenceFrame[];
  transitions: WholeFilmTransitionFrame[];
}

function stable(value: unknown): string {
  if (value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stable(entry)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}

export function wholeFilmFingerprint(production: Production): string {
  const visual = production.visual
    ? {
        upstreamRevision: production.visual.upstreamRevision,
        engineRevision: production.visual.engineRevision,
        style: production.visual.style,
        filmKit: production.visual.filmKit
          ? {
              status: production.visual.filmKit.status,
              sourceHash: production.visual.filmKit.sourceHash,
              components: production.visual.filmKit.components.map(
                ({ name, status, sourceHash }) => ({
                  name,
                  status,
                  sourceHash,
                }),
              ),
            }
          : undefined,
      }
    : undefined;
  return createHash('sha256')
    .update(
      stable({
        engine: WHOLE_FILM_REVIEW_VERSION,
        aspectRatio: production.aspectRatio,
        visual,
        scenes: production.scenes.map((scene) => ({
          id: scene.id,
          title: scene.title,
          visual: scene.visual,
          beats: scene.beats,
          cues: scene.cues,
          artwork: scene.artwork,
          review: scene.review?.status,
        })),
      }),
    )
    .digest('hex');
}

async function safeDirectory(root: string, parts: string[]) {
  if (!isAbsolute(root) || root.includes('\0'))
    throw new Error('Review root must be absolute');
  await mkdir(root, { recursive: true });
  const base = await realpath(root);
  let directory = base;
  for (const part of parts) {
    directory = join(directory, part);
    await mkdir(directory, { recursive: true });
    if ((await lstat(directory)).isSymbolicLink())
      throw new Error('Review directory must not be a symlink');
    const path = relative(base, await realpath(directory));
    if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path))
      throw new Error('Review path escapes root');
  }
  return directory;
}

async function contactSheet(
  inputs: { path: string; label: string }[],
  output: string,
  portrait: boolean,
  signal?: AbortSignal,
) {
  const width = portrait ? 270 : 480;
  const height = portrait ? 480 : 270;
  const cellHeight = height + 42;
  const columns = Math.min(3, inputs.length);
  const filters = inputs.map(
    (_input, index) =>
      `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
      `pad=${width}:${cellHeight}:(ow-iw)/2:0:color=white,` +
      `drawtext=text='${inputs[index]!.label}':x=12:y=${height + 10}:` +
      `fontcolor=black:fontsize=22[v${index}]`,
  );
  const layout = inputs
    .map(
      (_input, index) =>
        `${(index % columns) * width}_${Math.floor(index / columns) * cellHeight}`,
    )
    .join('|');
  filters.push(
    `${inputs.map((_input, index) => `[v${index}]`).join('')}xstack=inputs=${inputs.length}:layout=${layout}:fill=white[out]`,
  );
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(
      process.env.FFMPEG_PATH || (ffmpeg as unknown as string),
      [
        '-y',
        ...inputs.flatMap((input) => ['-i', input.path]),
        '-filter_complex',
        filters.join(';'),
        '-map',
        '[out]',
        '-frames:v',
        '1',
        '-q:v',
        '2',
        output,
      ],
      { signal },
    );
    let error = '';
    child.stderr.on('data', (value) => (error = (error + value).slice(-3000)));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolvePromise() : reject(new Error(error)),
    );
  });
}

export async function captureWholeFilmReview(
  production: Production,
  root: string,
  signal?: AbortSignal,
): Promise<WholeFilmEvidence> {
  signal?.throwIfAborted();
  validateFilmTiming(production);
  if (
    !/^[a-zA-Z0-9_-]{1,80}$/.test(production.projectId) ||
    !Number.isSafeInteger(production.revision) ||
    production.revision < 0 ||
    production.scenes.length === 0 ||
    production.scenes.some((scene) => !/^[a-zA-Z0-9_-]{1,80}$/.test(scene.id))
  )
    throw new Error('Invalid whole-film review identity');

  const prefix = [
    'production',
    production.projectId,
    `r${production.revision}`,
    'review',
    'whole-film',
  ];
  const directory = await safeDirectory(root, prefix);
  const runtime = createBrowserRuntime({ phase: 'reviewing' });
  let page: Awaited<ReturnType<typeof runtime.newFilmPage>> | undefined;
  const pages: WholeFilmEvidenceFrame[] = [];
  const transitions: WholeFilmTransitionFrame[] = [];
  const shots: { path: string; label: string }[] = [];
  try {
    page = await runtime.newFilmPage(production, signal);
    for (const [index, scene] of production.scenes.entries()) {
      signal?.throwIfAborted();
      const timeMs = scene.cues.at(-1)!.endMs! - 1;
      const result = await page.renderAt(timeMs);
      const error =
        result.thrown || result.engine[0]?.message || result.pageErrors[0];
      if (error) throw new Error(`Whole-film frame failed: ${error}`);
      const name = `page-${String(index + 1).padStart(2, '0')}-${scene.id}.png`;
      const path = join(directory, name);
      await page.screenshot(path);
      pages.push({
        sceneId: scene.id,
        timeMs,
        key: [...prefix, name].join('/'),
      });
      shots.push({ path, label: `${scene.id} ${timeMs}ms` });

      const next = production.scenes[index + 1];
      if (next) {
        const transitionMs = next.cues[0]!.startMs!;
        const transitionResult = await page.renderAt(transitionMs);
        const transitionError =
          transitionResult.thrown ||
          transitionResult.engine[0]?.message ||
          transitionResult.pageErrors[0];
        if (transitionError)
          throw new Error(`Whole-film transition failed: ${transitionError}`);
        const transitionName = `transition-${scene.id}-${next.id}.png`;
        const transitionPath = join(directory, transitionName);
        await page.screenshot(transitionPath);
        transitions.push({
          from: scene.id,
          to: next.id,
          timeMs: transitionMs,
          key: [...prefix, transitionName].join('/'),
        });
        shots.push({
          path: transitionPath,
          label: `${scene.id}-${next.id} ${transitionMs}ms`,
        });
      }
    }
    const sheetName = `whole-film-r${production.revision}.jpg`;
    const sheetPath = join(directory, sheetName);
    await contactSheet(
      shots,
      sheetPath,
      production.aspectRatio === '9:16',
      signal,
    );
    return {
      fingerprint: wholeFilmFingerprint(production),
      sheetKey: [...prefix, sheetName].join('/'),
      sheet: {
        mimeType: 'image/jpeg',
        data: (await readFile(sheetPath)).toString('base64'),
      },
      pages,
      transitions,
    };
  } finally {
    await page?.close();
    await runtime.close();
  }
}
