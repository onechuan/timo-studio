import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

import {
  piVisionGenerator,
  reviewModelConfig,
  reviewWholeFilm,
  type VisionGenerator,
} from '@timotv/agent';
import type { Production, ReviewFrame } from '@timotv/contracts';
import {
  captureWholeFilmReview,
  wholeFilmFingerprint,
  type WholeFilmEvidence,
} from '@timotv/renderer';

type Capture = (
  production: Production,
  root: string,
  signal?: AbortSignal,
) => Promise<WholeFilmEvidence>;

function stateFingerprint(production: Production, configRevision: string) {
  return createHash('sha256')
    .update(`${wholeFilmFingerprint(production)}:${configRevision}`)
    .digest('hex');
}

async function readSheet(
  production: Production,
  root: string,
  key: string,
): Promise<WholeFilmEvidence['sheet']> {
  if (!key.startsWith(`production/${production.projectId}/`))
    throw new Error('REVIEW_FILE_INVALID');
  const base = await realpath(root);
  const path = await realpath(resolve(root, key));
  if (!path.startsWith(base + sep)) throw new Error('REVIEW_FILE_INVALID');
  return {
    mimeType: 'image/jpeg',
    data: (await readFile(path)).toString('base64'),
  };
}

function evidenceFrames(evidence: WholeFilmEvidence): ReviewFrame[] {
  return [
    { key: evidence.sheetKey, timeMs: 0 },
    ...evidence.pages.map((page) => ({
      key: page.key,
      timeMs: page.timeMs,
      cueId: page.sceneId,
    })),
    ...evidence.transitions.map((transition) => ({
      key: transition.key,
      timeMs: transition.timeMs,
    })),
  ];
}

function restoredEvidence(
  production: Production,
  fingerprint: string,
  frames: ReviewFrame[],
): WholeFilmEvidence | undefined {
  const sheet = frames.find((frame) => frame.key.endsWith('.jpg'));
  if (!sheet) return undefined;
  const sceneIds = new Set(production.scenes.map((scene) => scene.id));
  const pages = frames.flatMap((frame) =>
    frame.cueId && sceneIds.has(frame.cueId)
      ? [{ sceneId: frame.cueId, timeMs: frame.timeMs, key: frame.key }]
      : [],
  );
  if (pages.length !== production.scenes.length) return undefined;
  return {
    fingerprint,
    sheetKey: sheet.key,
    pages,
    transitions: [],
  };
}

export function wholeFilmReviewer(
  root: string,
  env: NodeJS.ProcessEnv,
  injected?: VisionGenerator,
  capture: Capture = captureWholeFilmReview,
) {
  const config = reviewModelConfig(env);
  const model =
    injected ??
    (config.enabled && config.configured ? piVisionGenerator(env) : undefined);
  return async (
    production: Production,
    signal: AbortSignal,
    checkpoint?: (next: Production) => Promise<void>,
  ): Promise<Production> => {
    if (!production.visual) throw new Error('WHOLE_FILM_VISUAL_STATE_MISSING');
    const fingerprint = stateFingerprint(production, config.revision);
    const previous = production.visual.wholeFilmReview;
    if (
      previous?.fingerprint === fingerprint &&
      ['passed', 'unreviewed', 'needs_attention', 'accepted'].includes(
        previous.status,
      )
    )
      return production;

    let evidence =
      previous?.fingerprint === fingerprint
        ? restoredEvidence(production, fingerprint, previous.frames)
        : undefined;
    evidence ??= await capture(production, root, signal);
    evidence.fingerprint = fingerprint;
    evidence.sheet ??= await readSheet(production, root, evidence.sheetKey);
    const frames = evidenceFrames(evidence);
    let current: Production = {
      ...production,
      visual: {
        ...production.visual,
        wholeFilmReview: {
          fingerprint,
          status: 'checking',
          round: previous?.round ?? 0,
          frames,
          issues: [],
        },
      },
    };
    await checkpoint?.(current);

    if (!model)
      return {
        ...current,
        visual: {
          ...current.visual!,
          wholeFilmReview: {
            ...current.visual!.wholeFilmReview!,
            status: 'unreviewed',
          },
        },
      };

    const result = await reviewWholeFilm(current, evidence, model, signal);
    return {
      ...current,
      visual: {
        ...current.visual!,
        wholeFilmReview: {
          ...current.visual!.wholeFilmReview!,
          status: result.issues.length ? 'needs_attention' : 'passed',
          issues: result.issues,
        },
      },
      usage: {
        input: (production.usage?.input ?? 0) + result.usage.input,
        output: (production.usage?.output ?? 0) + result.usage.output,
      },
    };
  };
}
