import type {
  Production,
  FilmScene,
  ReviewFrame,
  ReviewIssue,
} from '@timotv/contracts';
import { isLegacyArtwork } from '@timotv/contracts';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, realpath, lstat, rm } from 'node:fs/promises';
import { join, relative, isAbsolute, sep } from 'node:path';
import { validateFilmTiming } from './preview.js';
import { createBrowserRuntime } from './browser-runtime.js';

/** Bump whenever deterministic rendering or measurement semantics change. */
export const REVIEW_ENGINE_VERSION = 'animation-review-4.1';
function stable(value: unknown): string {
  if (value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
export function reviewFingerprint(
  p: Production,
  index: number,
  configRevision = '',
): string {
  const s = p.scenes[index];
  if (!s) throw new Error('Unknown review scene');
  return createHash('sha256')
    .update(
      stable({
        artwork: s.artwork,
        cues: s.cues.map(({ id, text, startMs, endMs }) => ({
          id,
          text,
          startMs,
          endMs,
        })),
        title: s.title,
        visual: s.visual,
        beats: s.beats,
        layout: s.layout,
        style: p.brief.style,
        aspect: p.aspectRatio,
        engine: REVIEW_ENGINE_VERSION,
        configRevision,
      }),
    )
    .digest('hex');
}
function bounds(scene: FilmScene) {
  const first = scene.cues[0]?.startMs,
    last = scene.cues.at(-1)?.endMs;
  if (
    !Number.isSafeInteger(first) ||
    !Number.isSafeInteger(last) ||
    last! <= first!
  )
    throw new Error('Measured scene timing required');
  return { first: first!, last: last! - 1 };
}
function actionTimes(scene: FilmScene): number[][] {
  if (scene.artwork?.version !== 2) return [];
  return scene.artwork.tracks.map((track) =>
    track.keyframes.map((k) => {
      const cue = scene.cues.find((c) => c.id === k.at.cueId);
      if (cue?.startMs === undefined || cue.endMs === undefined)
        throw new Error('Unknown motion cue');
      return (
        cue.startMs + (cue.endMs - cue.startMs) * k.at.progress + k.at.offsetMs
      );
    }),
  );
}
function cameraTimes(scene: FilmScene): number[] {
  if (scene.artwork?.version !== 3) return [];
  const durations: Record<string, number> = {
    push: 280,
    pan: 300,
    slam: 374,
    shake: 250,
    back: 500,
  };
  const times: number[] = [];
  const pattern =
    /\bP\.(push|pan|slam|shake|back)\(\s*P\.(c|ce)\(\s*(\d+)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/g;
  for (const match of scene.artwork.source.matchAll(pattern)) {
    const cue = scene.cues[Number(match[3])];
    const base = match[2] === 'ce' ? cue?.endMs : cue?.startMs;
    if (base === undefined) continue;
    const atMs = base + Number(match[4] ?? 0) * 1000;
    times.push(atMs, atMs + durations[match[1]!]!);
  }
  return times;
}
function uniform<T>(values: T[], count: number): T[] {
  if (values.length <= count) return values;
  return Array.from(
    { length: count },
    (_, i) => values[Math.round((i * (values.length - 1)) / (count - 1))],
  );
}
export function planReviewSamples(scene: FilmScene): {
  times: number[];
  omittedCueIds: string[];
} {
  const { first, last } = bounds(scene),
    chosen = uniform(scene.cues, 22);
  const times = new Set([first, last]);
  const add = (t: number) => {
    if (times.size < 24)
      times.add(Math.max(first, Math.min(last, Math.floor(t))));
  };
  for (const cue of chosen) {
    if (scene.cues.length <= 7) add(cue.startMs!);
    add((cue.startMs! + cue.endMs!) / 2);
    if (scene.cues.length <= 7) add(cue.endMs! - 1);
  }
  for (const time of cameraTimes(scene)) add(time);
  for (const keys of actionTimes(scene))
    for (let i = 0; i < keys.length; i++) {
      add(keys[i]);
      if (i + 1 < keys.length) add((keys[i] + keys[i + 1]) / 2);
    }
  return {
    times: [...times].sort((a, b) => a - b),
    omittedCueIds: scene.cues
      .filter((c) => !chosen.includes(c))
      .map((c) => c.id),
  };
}
/** Geometry adds interior motion samples independently of the 24-image budget.
 * Bounded discrete samples are evidence, never proof over every animation instant. */
function geometryTimes(scene: FilmScene, images: number[]): number[] {
  const { first, last } = bounds(scene),
    candidates = new Set(images);
  for (const keys of actionTimes(scene))
    for (let i = 0; i < keys.length; i++) {
      candidates.add(Math.floor(Math.max(first, Math.min(last, keys[i]))));
      if (i + 1 < keys.length)
        for (let j = 1; j < 8; j++)
          candidates.add(
            Math.floor(
              Math.max(
                first,
                Math.min(last, keys[i] + ((keys[i + 1] - keys[i]) * j) / 8),
              ),
            ),
          );
    }
  return [
    ...new Set([
      ...images,
      ...uniform(
        [...candidates].sort((a, b) => a - b),
        384,
      ),
    ]),
  ].sort((a, b) => a - b);
}
async function safeAttempt(root: string, parts: string[]) {
  if (!isAbsolute(root) || root.includes('\0'))
    throw new Error('Review root must be absolute');
  await mkdir(root, { recursive: true });
  const base = await realpath(root);
  let dir = base;
  for (const part of parts) {
    dir = join(dir, part);
    await mkdir(dir).catch((e: NodeJS.ErrnoException) => {
      if (e.code !== 'EEXIST') throw e;
    });
    if ((await lstat(dir)).isSymbolicLink())
      throw new Error('Review directory must not be a symlink');
    const rel = relative(base, await realpath(dir));
    if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel))
      throw new Error('Review path escapes root');
  }
  return dir;
}
export async function captureSceneReview(
  p: Production,
  index: number,
  root: string,
  signal?: AbortSignal,
): Promise<{
  frames: ReviewFrame[];
  issues: ReviewIssue[];
  omittedCueIds: string[];
}> {
  signal?.throwIfAborted();
  validateFilmTiming(p);
  const s = p.scenes[index];
  if (
    !s ||
    !Number.isInteger(index) ||
    !Number.isSafeInteger(p.revision) ||
    p.revision < 0 ||
    ![p.projectId, s.id].every((id) => /^[a-zA-Z0-9_-]{1,80}$/.test(id))
  )
    throw new Error('Invalid review identity');
  const plan = planReviewSamples(s),
    prefix = [
      'production',
      p.projectId,
      `r${p.revision}`,
      'review',
      s.id,
      reviewFingerprint(p, index),
      randomUUID(),
    ];
  const directory = await safeAttempt(root, prefix);
  const runtime = createBrowserRuntime({
    phase: 'reviewing',
    context: { sceneId: s.id },
  });
  const frames: ReviewFrame[] = [],
    issues: ReviewIssue[] = [];
  let atMs = plan.times[0];
  let page: Awaited<ReturnType<typeof runtime.newFilmPage>> | undefined;
  try {
    signal?.throwIfAborted();
    page = await runtime.newFilmPage(p, signal);
    const initial = await page.renderAt(atMs);
    const buildErrors = initial.engine.filter((error) => error.page === s.id);
    if (buildErrors.length) {
      issues.push(
        ...buildErrors.map((error: { message?: string }) => ({
          kind: 'runtime' as const,
          severity: 'error' as const,
          atMs,
          elementIds: [],
          what: String(error.message || '页面绘制程序构建失败。').slice(0, 600),
          fix: '修复页面绘制错误后重新审片。',
        })),
      );
      return { frames, issues, omittedCueIds: plan.omittedCueIds };
    }
    const seen = new Set<string>();
    for (const time of geometryTimes(s, plan.times)) {
      signal?.throwIfAborted();
      atMs = time;
      // Catch only deterministic page code failures. Browser transport, cancellation,
      // screenshots and filesystem failures retain their original rejection semantics.
      const renderResult = await page.renderAt(time);
      const runtimeError =
        renderResult.thrown ||
        renderResult.engine.find((error) => error.page === s.id)?.message ||
        renderResult.pageErrors[0] ||
        null;
      if (runtimeError !== null) {
        issues.push({
          kind: 'runtime',
          severity: 'error',
          atMs: time,
          elementIds: [],
          what: runtimeError || '页面渲染失败。',
          fix: '修复页面渲染错误后重新审片。',
        });
        break;
      }
      const measured = await page.measure({
        atMs: time,
        decorativeIds: (isLegacyArtwork(s.artwork) ? s.artwork.elements : [])
          .filter(
            (e) =>
              e.type === 'group' ||
              (e.type === 'rect' &&
                (e.fill === 'paper' || e.fill === 'panel') &&
                e.width * e.height >= 100000),
          )
          .map((e) => e.id),
      });
      for (const issue of measured) {
        const key = JSON.stringify([issue.what, issue.elementIds]);
        if (!seen.has(key)) {
          seen.add(key);
          issues.push(issue);
        }
      }
      if (plan.times.includes(time)) {
        const name = `${time}.png`;
        const path = join(directory, name);
        const repeatPath = join(directory, `${time}.repeat.png`);
        await page.screenshot(path);
        const repeated = await page.renderAt(time);
        const repeatError =
          repeated.thrown ||
          repeated.engine.find((error) => error.page === s.id)?.message ||
          repeated.pageErrors[0];
        if (repeatError) {
          issues.push({
            kind: 'runtime',
            severity: 'error',
            atMs: time,
            elementIds: [],
            what: String(repeatError).slice(0, 600),
            fix: '修复重复渲染失败，确保同一时间点可以稳定重放。',
          });
          break;
        }
        try {
          await page.screenshot(repeatPath);
          const [firstImage, repeatImage] = await Promise.all([
            readFile(path),
            readFile(repeatPath),
          ]);
          if (
            createHash('sha256').update(firstImage).digest('hex') !==
            createHash('sha256').update(repeatImage).digest('hex')
          ) {
            issues.push({
              kind: 'runtime',
              severity: 'error',
              atMs: time,
              elementIds: [],
              what: '同一时间点重复渲染得到不同像素，页面程序不确定。',
              fix: '移除随机数、系统时间、计时器或依赖上一次渲染的可变状态。',
            });
            break;
          }
        } finally {
          await rm(repeatPath, { force: true });
        }
        frames.push({
          key: [...prefix, name].join('/'),
          timeMs: time,
          cueId: s.cues.find((c) => c.startMs! <= time && c.endMs! > time)?.id,
        });
      }
    }
    return { frames, issues, omittedCueIds: plan.omittedCueIds };
  } finally {
    await page?.close();
    await runtime.close();
  }
}
