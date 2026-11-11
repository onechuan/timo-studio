import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { z } from 'zod';

import {
  drawingStyleForProduction,
  FRAMETELL_ENGINE_REVISION,
  FRAMETELL_UPSTREAM_REVISION,
  generateFilmKitPart,
  planFilmKit,
  piVisionGenerator,
  reviewModelConfig,
  type JsonGenerator,
  type VisionGenerator,
} from '@timotv/agent';
import type {
  FilmKitReviewIssue,
  FilmKitState,
  Production,
} from '@timotv/contracts';
import {
  captureFilmKitReview,
  filmKitFingerprint,
  type FilmKitEvidence,
} from '@timotv/renderer';

const verdictSchema = z
  .object({
    pass: z.boolean(),
    issues: z
      .array(
        z
          .object({
            component: z.string().regex(/^[a-z][A-Za-z0-9]{1,23}$/),
            what: z.string().trim().min(1).max(600),
            fix: z.string().trim().min(1).max(1000),
          })
          .strict(),
      )
      .max(6),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.pass !== (value.issues.length === 0))
      context.addIssue({ code: 'custom', message: '审片结论与问题不一致' });
  });

const system = `你是 Film Kit 独立视觉审片员。每张图对应一个跨页复用组件。
检查主体是否完整、清楚、符合 what，是否裁切、遮挡、空白、过小或明显崩坏。不要因个人审美偏好判失败。
调用 submit：{pass:boolean,issues:[{component:string,what:string,fix:string}]}。component 只能使用输入名称。通过时 issues 为空。`;

type Capture = (
  production: Production,
  root: string,
  signal?: AbortSignal,
  configRevision?: string,
) => Promise<FilmKitEvidence>;

export function planProductionFilmKit(production: Production): Production {
  const planned = planFilmKit(production);
  return {
    ...production,
    visual: {
      ...production.visual,
      upstreamRevision: FRAMETELL_UPSTREAM_REVISION,
      engineRevision: FRAMETELL_ENGINE_REVISION,
      style: drawingStyleForProduction(production),
      filmKit: planned.length
        ? {
            status: 'planned',
            components: planned.map((item) => ({
              ...item,
              status: 'planned' as const,
            })),
          }
        : { status: 'none', components: [] },
    },
  };
}

export async function generateProductionFilmKitPart(
  production: Production,
  name: string,
  model: JsonGenerator,
  signal?: AbortSignal,
): Promise<Production> {
  const kit = production.visual?.filmKit;
  const component = kit?.components.find((item) => item.name === name);
  if (
    !kit ||
    !component ||
    !['planned', 'generating'].includes(component.status)
  )
    return production;

  const generated = await generateFilmKitPart(
    production,
    component,
    model,
    signal,
  );
  const components = kit.components.map((item) =>
    item.name === name
      ? {
          ...item,
          status: 'checking' as const,
          source: generated.source,
          sourceHash: generated.sourceHash,
          checkSource: generated.checkSource,
          error: undefined,
        }
      : item,
  );
  const source = components
    .filter((item) => item.source && item.status !== 'failed')
    .map((item) => item.source!.trim())
    .join('\n\n');
  const pending = components.some((item) =>
    ['planned', 'generating'].includes(item.status),
  );
  return {
    ...production,
    visual: {
      ...production.visual!,
      filmKit: {
        ...kit,
        status: pending ? 'generating' : source ? 'checking' : 'failed',
        components,
        source: source || undefined,
        sourceHash: source
          ? createHash('sha256').update(source, 'utf8').digest('hex')
          : undefined,
        fingerprint: undefined,
        frames: undefined,
        issues: undefined,
      },
    },
    usage: {
      input: (production.usage?.input ?? 0) + generated.usage.input,
      output: (production.usage?.output ?? 0) + generated.usage.output,
    },
  };
}

function componentForIssue(
  kit: FilmKitState,
  evidence: FilmKitEvidence,
  atMs: number,
) {
  const nearest = evidence.frames.reduce((best, frame) =>
    Math.abs(frame.timeMs - atMs) < Math.abs(best.timeMs - atMs) ? frame : best,
  );
  return kit.components.find((component) => component.name === nearest.cueId)
    ?.name;
}

export function filmKitReviewer(
  root: string,
  env: NodeJS.ProcessEnv,
  injected?: VisionGenerator,
  capture: Capture = captureFilmKitReview,
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
    const kit = production.visual?.filmKit;
    if (!kit?.source || !kit.sourceHash) return production;
    const fingerprint = filmKitFingerprint(production, config.revision);
    if (
      kit.fingerprint === fingerprint &&
      ['passed', 'partial', 'failed'].includes(kit.status)
    )
      return production;

    const evidence =
      kit.fingerprint === fingerprint && kit.frames?.length
        ? {
            fingerprint,
            frames: kit.frames,
            issues: (kit.issues ?? []).map((issue) => ({
              ...issue,
              elementIds: [],
            })),
          }
        : await capture(production, root, signal, config.revision);
    let issues: FilmKitReviewIssue[] = evidence.issues.map((issue) => ({
      component: componentForIssue(kit, evidence, issue.atMs),
      kind: issue.kind,
      severity: issue.severity,
      atMs: issue.atMs,
      what: issue.what,
      fix: issue.fix,
    }));
    let current: Production = {
      ...production,
      visual: {
        ...production.visual!,
        filmKit: {
          ...kit,
          status: 'checking',
          fingerprint,
          frames: evidence.frames,
          issues,
        },
      },
    };
    await checkpoint?.(current);

    let usage = { input: 0, output: 0 };
    if (model && evidence.frames.length) {
      const base = await realpath(root);
      const images = await Promise.all(
        evidence.frames.map(async (frame) => {
          if (!frame.key.startsWith(`production/${production.projectId}/`))
            throw new Error('REVIEW_FILE_INVALID');
          const path = await realpath(resolve(root, frame.key));
          if (!path.startsWith(base + sep))
            throw new Error('REVIEW_FILE_INVALID');
          return {
            mimeType: 'image/png',
            data: (await readFile(path)).toString('base64'),
          };
        }),
      );
      const result = await model.generate(
        system,
        JSON.stringify({
          style: production.visual?.style,
          aspectRatio: production.aspectRatio,
          components: kit.components.map(({ name, what }) => ({ name, what })),
          frames: evidence.frames.map(({ cueId, timeMs }) => ({
            component: cueId,
            timeMs,
          })),
        }),
        images,
        signal,
      );
      const verdict = verdictSchema.parse(result.value);
      const names = new Set(kit.components.map((component) => component.name));
      if (verdict.issues.some((issue) => !names.has(issue.component)))
        throw new Error('REVIEW_INVALID');
      issues = [
        ...issues,
        ...verdict.issues.map((issue) => ({
          ...issue,
          kind: 'visual' as const,
          severity: 'warning' as const,
          atMs:
            evidence.frames.find((frame) => frame.cueId === issue.component)
              ?.timeMs ?? 0,
        })),
      ];
      usage = result.usage;
    }

    const failed = new Set(
      issues.flatMap((issue) => (issue.component ? [issue.component] : [])),
    );
    const components = kit.components.map((component) =>
      failed.has(component.name)
        ? {
            ...component,
            status: 'failed' as const,
            error: issues
              .filter((issue) => issue.component === component.name)
              .map((issue) => issue.what)
              .join('；')
              .slice(0, 1000),
          }
        : { ...component, status: 'passed' as const, error: undefined },
    );
    const passed = components.filter(
      (component) => component.status === 'passed' && component.source,
    );
    const source = passed
      .map((component) => component.source!.trim())
      .join('\n\n');
    const status =
      passed.length === components.length
        ? 'passed'
        : passed.length > 0
          ? 'partial'
          : 'failed';
    current = {
      ...current,
      visual: {
        ...current.visual!,
        filmKit: {
          ...kit,
          status,
          components,
          source: source || undefined,
          sourceHash: source
            ? createHash('sha256').update(source, 'utf8').digest('hex')
            : undefined,
          fingerprint,
          frames: evidence.frames,
          issues,
        },
      },
      usage: {
        input: (production.usage?.input ?? 0) + usage.input,
        output: (production.usage?.output ?? 0) + usage.output,
      },
    };
    return current;
  };
}
