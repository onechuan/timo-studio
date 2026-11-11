import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import {
  drawingStyleSchema,
  sceneProgramV3Schema,
  type DrawingStyle,
  type Production,
} from '@timotv/contracts';
import type { JsonGenerator } from './index.js';
import {
  assertSafeProgramSource,
  drawingComponentIds,
  programArtworkOutputSchema,
} from './program-output.js';
import {
  ArtworkValidationError,
  artworkValidationDetails,
} from './validation-error.js';
import { loadProgramArtworkSkill } from '../skills/index.js';

const styleMap: Record<Production['brief']['style'], DrawingStyle> = {
  warm: 'warm-story',
  chalk: 'chalkboard',
  tech: 'tech-dark',
  brand: 'vector',
};

const prompt = () =>
  readFileSync(
    new URL('../../prompts/PAGE_PROGRAM.md', import.meta.url),
    'utf8',
  );
const visualStyle = (p: Production) =>
  readFileSync(
    new URL(`../../skills/visual-styles/${p.brief.style}.md`, import.meta.url),
    'utf8',
  );
const styleGrammar = (style: DrawingStyle) =>
  readFileSync(
    new URL(
      `../../../drawing-engine/styles/${style}/GRAMMAR.md`,
      import.meta.url,
    ),
    'utf8',
  );

export async function illustrateFilmSceneProgram(
  p: Production,
  index: number,
  model: JsonGenerator,
  signal?: AbortSignal,
  feedback?: string,
): Promise<Production> {
  const scene = p.scenes[index];
  if (
    !scene ||
    !scene.cues.length ||
    scene.cues.some(
      (cue) => cue.startMs === undefined || cue.endMs === undefined,
    )
  )
    throw new Error('绘图需要已完成配音的逐句时间');
  const style = drawingStyleSchema.parse(styleMap[p.brief.style]);
  const checkedComponents =
    p.visual?.filmKit && ['passed', 'partial'].includes(p.visual.filmKit.status)
      ? p.visual.filmKit.components.filter(
          (component) =>
            component.status === 'passed' && component.pages.includes(scene.id),
        )
      : [];
  const candidateSchema = z
    .object({
      sceneId: z.literal(scene.id),
      artwork: z
        .object({
          version: z.literal(3),
          runtime: z.literal('timotv-dsl-1'),
          intent: z.string().trim().min(1).max(1000),
          source: z
            .string()
            .min(1)
            .refine(
              (source) =>
                new TextEncoder().encode(source).byteLength <= 100_000,
              '页面程序不能超过100000字节',
            ),
          style: z.literal(style),
          extras: z.array(z.enum(drawingComponentIds)).max(32),
        })
        .strict(),
    })
    .strict()
    .superRefine((value, ctx) => {
      try {
        assertSafeProgramSource(scene.id, value.artwork.source);
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['artwork', 'source'],
          message: '页面程序包含未允许的能力或注册了错误的场景',
        });
      }
    });
  const input = {
    sceneId: scene.id,
    title: scene.title,
    visual: scene.visual,
    beats: scene.beats,
    layout: scene.layout ?? 'auto',
    cues: scene.cues.map(({ id, text, startMs, endMs }, cueIndex) => ({
      id,
      text,
      startMs,
      endMs,
      cueIndex,
      localStartSec: (startMs! - scene.cues[0]!.startMs!) / 1000,
      localEndSec: (endMs! - scene.cues[0]!.startMs!) / 1000,
    })),
    aspectRatio: p.aspectRatio,
    engineStyle: style,
    standingDirections: {
      filmTitle: p.storyboard?.title ?? p.brief.topic,
      filmSummary: p.storyboard?.summary,
      aspectRatio: p.aspectRatio,
      engineStyle: style,
      continuity:
        '延续已经建立的主体外观、颜色含义和空间关系；只有讲解需要时才改变。',
    },
    filmKit: {
      status: p.visual?.filmKit?.status ?? 'none',
      components: checkedComponents.map((component) => component.name),
      usage: checkedComponents.map((component) => ({
        name: component.name,
        what: component.what,
        example: component.checkSource,
      })),
    },
    previousPage: (() => {
      const previousScene = p.scenes[index - 1];
      const previous = previousScene?.artwork;
      if (!previousScene || !previous) return undefined;
      return {
        sceneId: previousScene.id,
        title: previousScene.title,
        visual: previousScene.visual,
        intent: previous.intent,
        ...(previous.version === 3
          ? {
              style: previous.style,
              extras: previous.extras,
              sourceHash: previous.sourceHash,
            }
          : {}),
      };
    })(),
    previousArtwork: (() => {
      const previous = p.scenes[index - 1]?.artwork;
      return previous?.version === 3
        ? {
            version: previous.version,
            intent: previous.intent,
            style: previous.style,
            extras: previous.extras,
            sourceHash: previous.sourceHash,
          }
        : previous;
    })(),
    ...(feedback ? { originalArtwork: scene.artwork, feedback } : {}),
  };
  const system = `${prompt()}\n\n${loadProgramArtworkSkill()}\n\n${visualStyle(p)}\n\n# 上游画风语法\n${styleGrammar(style)}`;
  let totals = p.usage ?? { input: 0, output: 0 };
  let lastIssues: z.ZodIssue[] = [];
  let repair: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    const user = JSON.stringify({
      ...input,
      ...(attempt
        ? {
            repair: {
              instructions: '重新生成完整页面程序，仅修正以下受信任的校验问题',
              issues: repair,
            },
          }
        : {}),
    });
    let result;
    try {
      result = model.generateStructured
        ? await model.generateStructured(
            system,
            user,
            programArtworkOutputSchema(scene.id, style),
            signal,
          )
        : await model.generate(system, user, signal);
    } catch (error) {
      if (
        attempt === 0 &&
        error instanceof Error &&
        ['MODEL_OUTPUT_LIMIT', 'MODEL_NO_SUBMISSION'].includes(error.message)
      ) {
        repair = [
          error.message === 'MODEL_OUTPUT_LIMIT'
            ? '上次输出过长，精简为一个主体、2–4个辅助对象和必要标签。'
            : '上次未调用 submit，请直接提交完整 JSON。',
        ];
        continue;
      }
      throw error;
    }
    totals = {
      input: totals.input + result.usage.input,
      output: totals.output + result.usage.output,
    };
    const parsed = candidateSchema.safeParse(result.value);
    if (parsed.success) {
      const extras = [
        ...new Set([
          ...parsed.data.artwork.extras,
          ...(style === 'warm-story' ? (['warm'] as const) : []),
        ]),
      ];
      const sourceHash = createHash('sha256')
        .update(parsed.data.artwork.source, 'utf8')
        .digest('hex');
      const artwork = sceneProgramV3Schema.parse({
        ...parsed.data.artwork,
        extras,
        sourceHash,
      });
      return {
        ...p,
        usage: totals,
        scenes: p.scenes.map((current, sceneIndex) =>
          sceneIndex === index ? { ...current, artwork } : current,
        ),
      };
    }
    lastIssues = parsed.error.issues;
    repair = artworkValidationDetails(lastIssues, true).slice(0, 12);
  }
  throw new ArtworkValidationError(index + 1, lastIssues);
}
