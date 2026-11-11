import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import type { Production, SceneReview } from '@timotv/contracts';
import { captureSceneReview, reviewFingerprint } from '@timotv/renderer';
import {
  reviewFilmScene,
  reviewModelConfig,
  piVisionGenerator,
  type VisionGenerator,
} from '@timotv/agent';

/** Evidence is persisted before a model call; a failed provider resumes from those exact frames. */
export function sceneReviewer(
  root: string,
  env: NodeJS.ProcessEnv,
  injected?: VisionGenerator,
) {
  const config = reviewModelConfig(env),
    enabled = config.enabled && config.configured;
  const model = injected ?? (enabled ? piVisionGenerator(env) : undefined);
  return async (
    p: Production,
    index: number,
    signal: AbortSignal,
    checkpoint?: (next: Production) => Promise<void>,
  ): Promise<Production> => {
    const fingerprint = reviewFingerprint(p, index, config.revision);
    const previous = p.scenes[index].review;
    if (
      previous?.fingerprint === fingerprint &&
      ['passed', 'unreviewed', 'accepted', 'needs_attention'].includes(
        previous.status,
      )
    )
      return p;
    const set = (review: SceneReview) => ({
      ...p,
      scenes: p.scenes.map((s, i) => (i === index ? { ...s, review } : s)),
    });
    let evidence =
      previous?.fingerprint === fingerprint && previous.frames.length
        ? {
            frames: previous.frames,
            issues: previous.issues.filter((i) => i.kind !== 'visual'),
            omittedCueIds: previous.omittedCueIds,
          }
        : await captureSceneReview(p, index, root, signal);
    let review: SceneReview = {
      ...evidence,
      fingerprint,
      round: previous?.round ?? 0,
      status: 'checking',
      mode: model ? 'visual' : 'layout',
    };
    p = set(review);
    await checkpoint?.(p);
    let used = { input: 0, output: 0 };
    if (
      model &&
      evidence.frames.length &&
      !evidence.issues.some((i) => i.kind === 'runtime')
    ) {
      const base = await realpath(root);
      const images = await Promise.all(
        evidence.frames.map(async (frame) => {
          if (!frame.key.startsWith(`production/${p.projectId}/`))
            throw new Error('REVIEW_FILE_INVALID');
          const path = await realpath(resolve(root, frame.key));
          if (!path.startsWith(base + sep))
            throw new Error('REVIEW_FILE_INVALID');
          return { ...frame, data: (await readFile(path)).toString('base64') };
        }),
      );
      try {
        const reviewInput = {
          ...p,
          scenes: p.scenes.map((s, i) =>
            i === index
              ? { ...s, review: { ...review, issues: previous?.issues ?? [] } }
              : s,
          ),
        };
        const result = await reviewFilmScene(
          reviewInput,
          index,
          images,
          evidence.issues,
          model,
          signal,
        );
        used = result.usage;
        review = { ...review, issues: [...evidence.issues, ...result.issues] };
      } catch (error) {
        const code = error instanceof Error ? error.message : '';
        throw new Error(
          /^MODEL_[A-Z_]+$/.test(code)
            ? `REVIEW_${code}`
            : 'REVIEW_SERVICE_FAILED',
        );
      }
    }
    const problems = review.issues.some(
      (i) => i.severity === 'error' || i.kind === 'visual',
    );
    review = {
      ...review,
      status: problems ? 'needs_attention' : model ? 'passed' : 'unreviewed',
    };
    return {
      ...set(review),
      usage: {
        input: (p.usage?.input ?? 0) + used.input,
        output: (p.usage?.output ?? 0) + used.output,
      },
    };
  };
}
