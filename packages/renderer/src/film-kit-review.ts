import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';

import type {
  FilmKitState,
  Production,
  ReviewFrame,
  ReviewIssue,
} from '@timotv/contracts';
import { createBrowserRuntime } from './browser-runtime.js';
import { hashProgramSource } from './program.js';

export const FILM_KIT_REVIEW_VERSION = 'film-kit-review-1.0';

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

function requireFilmKit(production: Production): FilmKitState {
  const kit = production.visual?.filmKit;
  if (!kit?.source || !kit.sourceHash || kit.components.length === 0)
    throw new Error('FILM_KIT_MISSING');
  return kit;
}

export function filmKitFingerprint(
  production: Production,
  configRevision = '',
): string {
  const kit = requireFilmKit(production);
  return createHash('sha256')
    .update(
      stable({
        sourceHash: kit.sourceHash,
        components: kit.components.map(
          ({ name, what, pages, sourceHash, checkSource }) => ({
            name,
            what,
            pages,
            sourceHash,
            checkSource,
          }),
        ),
        style: production.visual?.style,
        aspectRatio: production.aspectRatio,
        engine: FILM_KIT_REVIEW_VERSION,
        configRevision,
      }),
    )
    .digest('hex');
}

function reviewComponents(kit: FilmKitState) {
  return kit.components.filter(
    (component) =>
      component.source &&
      component.sourceHash &&
      component.checkSource &&
      !['failed', 'dropped'].includes(component.status),
  );
}

export function filmKitReviewProduction(production: Production): Production {
  const kit = requireFilmKit(production);
  const components = reviewComponents(kit);
  if (!components.length) throw new Error('FILM_KIT_MISSING');
  const cueMs = 2600;
  const source = `TIMO.visual('kit', (P) => {\n${components
    .map(
      (component, index) =>
        `  {\n${component.checkSource!.replace(
          /\bP\.(c|ce|cw)\(\s*0\b/g,
          `P.$1(${index}`,
        )}\n  }`,
    )
    .join('\n')}\n});`;
  const durationMs = components.length * cueMs;
  const scene = {
    id: 'kit',
    title: 'Film Kit',
    visual: '逐个检查影片复用组件',
    beats: components.map((component) => component.what),
    cues: components.map((component, index) => ({
      id: `kit-${component.name}`,
      text: component.name,
      startMs: index * cueMs,
      endMs: (index + 1) * cueMs,
    })),
    artwork: {
      version: 3 as const,
      runtime: 'timotv-dsl-1' as const,
      intent: '在独立检查页逐个完整展示 Film Kit 组件',
      source,
      sourceHash: hashProgramSource(source),
      style: production.visual!.style,
      extras: [],
    },
  };
  return {
    ...production,
    scenes: [scene],
    durationMs,
    artifacts: {},
  };
}

async function safeDirectory(root: string, parts: string[]) {
  if (!isAbsolute(root) || root.includes('\0'))
    throw new Error('Review root must be absolute');
  await mkdir(root, { recursive: true });
  const base = await realpath(root);
  let directory = base;
  for (const part of parts) {
    directory = join(directory, part);
    await mkdir(directory).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'EEXIST') throw error;
    });
    if ((await lstat(directory)).isSymbolicLink())
      throw new Error('Review directory must not be a symlink');
    const path = relative(base, await realpath(directory));
    if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path))
      throw new Error('Review path escapes root');
  }
  return directory;
}

export interface FilmKitEvidence {
  fingerprint: string;
  frames: ReviewFrame[];
  issues: ReviewIssue[];
}

export async function captureFilmKitReview(
  production: Production,
  root: string,
  signal?: AbortSignal,
  configRevision = '',
): Promise<FilmKitEvidence> {
  signal?.throwIfAborted();
  if (
    !/^[a-zA-Z0-9_-]{1,80}$/.test(production.projectId) ||
    !Number.isSafeInteger(production.revision) ||
    production.revision < 0
  )
    throw new Error('Invalid review identity');
  const kit = requireFilmKit(production);
  const components = reviewComponents(kit);
  const fingerprint = filmKitFingerprint(production, configRevision);
  const prefix = [
    'production',
    production.projectId,
    `r${production.revision}`,
    'review',
    'film-kit',
    fingerprint,
    randomUUID(),
  ];
  const directory = await safeDirectory(root, prefix);
  const reviewProduction = filmKitReviewProduction(production);
  const runtime = createBrowserRuntime({
    phase: 'reviewing',
    context: { sceneId: 'film-kit' },
  });
  const frames: ReviewFrame[] = [];
  const issues: ReviewIssue[] = [];
  let page: Awaited<ReturnType<typeof runtime.newFilmPage>> | undefined;

  try {
    page = await runtime.newFilmPage(reviewProduction, signal);
    for (const [index, component] of components.entries()) {
      signal?.throwIfAborted();
      const atMs = index * 2600 + 2300;
      const result = await page.renderAt(atMs);
      const runtimeError =
        result.thrown || result.engine[0]?.message || result.pageErrors[0];
      if (runtimeError)
        issues.push({
          kind: 'runtime',
          severity: 'error',
          atMs,
          elementIds: [],
          what: String(runtimeError).slice(0, 600),
          fix: `修复 Film Kit 组件 ${component.name} 后重新检查。`,
        });
      else issues.push(...(await page.measure({ atMs, decorativeIds: [] })));
      const name = `${index}-${component.name}.png`;
      await page.screenshot(join(directory, name));
      frames.push({
        key: [...prefix, name].join('/'),
        timeMs: atMs,
        cueId: component.name,
      });
    }
    return { fingerprint, frames, issues };
  } finally {
    await page?.close();
    await runtime.close();
  }
}
