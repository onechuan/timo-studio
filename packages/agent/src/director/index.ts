import { z } from 'zod';
import type { TSchema } from 'typebox';
import {
  ArtworkValidationError,
  artworkValidationDetails,
} from './validation-error.js';
import { fitArtwork } from './layout.js';
import {
  artworkOutputSchema,
  normalizeArtworkCandidate,
  safeArtworkRepairDraft,
} from './artwork-output.js';
import { readFileSync } from 'node:fs';
import { loadArtworkSkill, loadContentSkill } from '../skills/index.js';
import {
  artworkBounds,
  legacyArtworkSchema,
  validateArtworkCues,
  storyboardPlanSchema,
  scriptScenesSchema,
  type Production,
} from '@timotv/contracts';
export * from './film-kit.js';
export * from './page-lanes.js';
export { illustrateFilmSceneProgram } from './program.js';
type GeneratedJson = {
  value: unknown;
  usage: { input: number; output: number };
};
export interface JsonGenerator {
  generate(
    system: string,
    user: string,
    signal?: AbortSignal,
  ): Promise<GeneratedJson>;
  generateStructured?(
    system: string,
    user: string,
    schema: TSchema,
    signal?: AbortSignal,
  ): Promise<GeneratedJson>;
}
const prompt = (name: string) =>
  readFileSync(new URL(`../../prompts/${name}.md`, import.meta.url), 'utf8');
const visualStyle = (p: Production) =>
  readFileSync(
    new URL(`../../skills/visual-styles/${p.brief.style}.md`, import.meta.url),
    'utf8',
  );
const usage = (p: Production, u: { input: number; output: number }) => ({
  input: (p.usage?.input ?? 0) + u.input,
  output: (p.usage?.output ?? 0) + u.output,
});
export async function planFilm(
  p: Production,
  model: JsonGenerator,
  signal?: AbortSignal,
): Promise<Production> {
  const user = JSON.stringify({
    topic: p.brief.topic,
    materials: p.brief.materials,
    durationSec: p.brief.durationSec,
    language: p.brief.language,
    aspectRatio: p.aspectRatio,
    style: p.brief.style,
  });
  const result = await model.generate(
    `${prompt('PLANNER')}\n\n${loadContentSkill(p.brief.contentType, 'planning')}\n\n${visualStyle(p)}`,
    user,
    signal,
  );
  const storyboard = storyboardPlanSchema.parse(result.value);
  const max = Math.max(2, Math.ceil((p.brief.durationSec / 60) * 4));
  if (storyboard.scenes.length > max)
    throw new Error('分镜页数超出目标时长，请重新规划');
  return {
    ...p,
    storyboard,
    scenes: [],
    artifacts: {},
    stage: 'approval',
    usage: usage(p, result.usage),
  };
}
export async function writeFilmScript(
  p: Production,
  model: JsonGenerator,
  signal?: AbortSignal,
): Promise<Production> {
  if (!p.storyboard) throw new Error('缺少已批准的分镜');
  const result = await model.generate(
    `${prompt('SCRIPT')}\n\n${loadContentSkill(p.brief.contentType, 'script')}`,
    JSON.stringify({
      topic: p.brief.topic,
      storyboard: p.storyboard,
      materials: p.brief.materials,
      durationSec: p.brief.durationSec,
      language: p.brief.language,
    }),
    signal,
  );
  const scenes = scriptScenesSchema.parse(
    (result.value as { scenes?: unknown })?.scenes,
  );
  if (
    scenes.map((s) => s.id).join('|') !==
    p.storyboard.scenes.map((s) => s.id).join('|')
  )
    throw new Error('口播必须逐页覆盖已批准分镜，保持顺序和 ID');
  return {
    ...p,
    scenes: scenes.map((s, i) => {
      const approved = p.storyboard!.scenes[i];
      return {
        id: s.id,
        title: approved.title,
        visual: approved.visual,
        beats: approved.beats,
        layout: approved.layout,
        cues: s.cues.map(({ id, text }) => ({ id, text })),
      };
    }),
    stage: 'narrating',
    artifacts: {},
    usage: usage(p, result.usage),
  };
}

/** Generate one independently retryable, measured scene. Never persist provider output before validation. */
export async function illustrateFilmScene(
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
    scene.cues.some((c) => c.startMs === undefined || c.endMs === undefined)
  )
    throw new Error('绘图需要已完成配音的逐句时间');
  const bounds = artworkBounds(p.aspectRatio);
  const baseSchema = z
    .object({ sceneId: z.literal(scene.id), artwork: legacyArtworkSchema })
    .strict();
  const schema = baseSchema.superRefine((v, ctx) => {
    const issue = (message: string, path: (string | number)[] = ['artwork']) =>
      ctx.addIssue({ code: 'custom', message, path });
    for (const error of validateArtworkCues(v.artwork, scene.cues))
      issue(error);
    // V2's schema already enforces its 48-object budget, including group nodes.
    if (v.artwork.version === 1 && v.artwork.elements.length > 24)
      issue('每页最多24个绘图对象，请精简构图');
    if ([...v.artwork.intent].length > 200)
      issue('绘图意图最多200字，请简洁描述');
    if (
      !v.artwork.elements.some(
        (e) =>
          e.cueIndex === 0 &&
          e.opacity > 0 &&
          ['illustration', 'path', 'ellipse', 'rect', 'component'].includes(
            e.type,
          ) &&
          e.width >= 100 &&
          e.height >= 100,
      )
    )
      issue('首句需要至少一个宽高均不小于100的主体绘图对象');
    for (const [elementIndex, e] of v.artwork.elements.entries()) {
      const objectId = /^[a-zA-Z0-9_-]{1,80}$/.test(e.id) ? e.id : '(无效ID)';
      if (
        !e.parentId &&
        (e.x < bounds.left ||
          e.y < bounds.top ||
          e.x + e.width > bounds.right ||
          e.y + e.height > bounds.bottom)
      )
        issue(
          `对象 ${objectId} 边界 x=${e.x}, y=${e.y}, width=${e.width}, height=${e.height} 超出安全区：x>=${bounds.left}, y>=${bounds.top}, x+width<=${bounds.right}, y+height<=${bounds.bottom}；当前右边=${e.x + e.width}，下边=${e.y + e.height}`,
          ['artwork', 'elements', elementIndex],
        );
      if (e.cueIndex >= scene.cues.length)
        issue(
          `对象 ${objectId} cueIndex=${e.cueIndex} 必须在0..${scene.cues.length - 1}之间`,
          ['artwork', 'elements', elementIndex, 'cueIndex'],
        );
      if (
        e.type === 'text' &&
        (e.fontSize < 28 ||
          e.height < e.fontSize * 1.2 ||
          [...e.text].reduce(
            (n, c) => n + (/[^\x00-\x7f]/.test(c) ? 1 : 0.6),
            0,
          ) *
            e.fontSize >
            e.width * Math.max(1, Math.floor(e.height / (e.fontSize * 1.2))))
      ) {
        const neededWidth = Math.ceil(
          [...e.text].reduce(
            (n, c) => n + (/[^\x00-\x7f]/.test(c) ? 1 : 0.6),
            0,
          ) * Math.max(28, e.fontSize),
        );
        issue(
          `对象 ${objectId} 文字框 width=${e.width}, height=${e.height}, fontSize=${e.fontSize}；字号至少28，当前字号至少需要单行宽${neededWidth}、行高${Math.ceil(Math.max(28, e.fontSize) * 1.2)}；可缩短标签或在安全区内扩大框`,
          ['artwork', 'elements', elementIndex, 'fontSize'],
        );
      }
    }
    // Objects persist after their cue: labels must remain legible in the final composition too.
    for (const label of v.artwork.version === 2
      ? []
      : v.artwork.elements.filter((e) => e.type === 'text')) {
      for (const other of v.artwork.elements) {
        if (
          other === label ||
          !['illustration', 'path', 'ellipse', 'text'].includes(other.type)
        )
          continue;
        const intersectionWidth = Math.max(
          0,
          Math.min(label.x + label.width, other.x + other.width) -
            Math.max(label.x, other.x),
        );
        const intersectionHeight = Math.max(
          0,
          Math.min(label.y + label.height, other.y + other.height) -
            Math.max(label.y, other.y),
        );
        const ratio =
          (intersectionWidth * intersectionHeight) /
          (label.width * label.height);
        if (ratio > 0.1) {
          const safeId = (id: string) =>
            /^[a-zA-Z0-9_-]{1,80}$/.test(id) ? id : '(无效ID)';
          issue(
            `文字对象 ${safeId(label.id)} 与对象 ${safeId(other.id)} 重叠${Math.round(ratio * 100)}%（最多10%）；将文字移到主体外的留白。文字框[${label.x},${label.y},${label.width},${label.height}]，另一对象框[${other.x},${other.y},${other.width},${other.height}]；所有句的对象最终同时存在`,
          );
        }
      }
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
    })),
    aspectRatio: p.aspectRatio,
    style: p.brief.style,
    bounds,
    previousArtwork: p.scenes[index - 1]?.artwork,
    ...(feedback ? { originalArtwork: scene.artwork, feedback } : {}),
  };
  const system = `${prompt('PAGE')}\n\n${loadArtworkSkill()}\n\n${visualStyle(p)}`;
  let totals = p.usage ?? { input: 0, output: 0 };
  let repair: string[] = [];
  let lastIssues: z.ZodIssue[] = [];
  let repairDraft: unknown | undefined;
  const outputSchema = artworkOutputSchema(scene.id);
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    let result: Awaited<ReturnType<JsonGenerator['generate']>>;
    try {
      const user = JSON.stringify({
        ...input,
        ...(attempt
          ? {
              repair: {
                instructions: '重新生成完整页面，仅修正以下校验问题',
                issues: repair,
                ...(repairDraft ? { draft: repairDraft } : {}),
              },
            }
          : {}),
      });
      result = model.generateStructured
        ? await model.generateStructured(system, user, outputSchema, signal)
        : await model.generate(system, user, signal);
    } catch (error) {
      if (
        attempt === 0 &&
        error instanceof Error &&
        error.message === 'MODEL_OUTPUT_LIMIT'
      ) {
        repair = [
          '上次输出过长。将构图精简到4–8个对象，优先完整内置插画与少量短标签/箭头，避免复杂路径；保留核心论点和逐句因果，intent最多80字。',
        ];
        continue;
      }
      if (
        attempt === 0 &&
        error instanceof Error &&
        error.message === 'MODEL_NO_SUBMISSION'
      ) {
        repair = [
          '上次没有调用 submit 工具。请直接调用 submit，提交完整页面对象，不要只输出说明文字或 Markdown。',
        ];
        continue;
      }
      throw error;
    }
    totals = {
      input: totals.input + result.usage.input,
      output: totals.output + result.usage.output,
    };
    const normalized = normalizeArtworkCandidate(result.value);
    const base = baseSchema.safeParse(normalized);
    const candidate = base.success
      ? { ...base.data, artwork: fitArtwork(base.data.artwork, p.aspectRatio) }
      : normalized;
    const parsed = schema.safeParse(candidate);
    if (parsed.success)
      return {
        ...p,
        usage: totals,
        scenes: p.scenes.map((s, i) =>
          i === index ? { ...s, artwork: parsed.data.artwork } : s,
        ),
      };
    const validatedDraft = baseSchema.safeParse(candidate);
    repairDraft = validatedDraft.success
      ? validatedDraft.data
      : safeArtworkRepairDraft(candidate, scene.id);
    // Only trusted messages/codes; never echo arbitrary keys or provider values into a repair prompt.
    lastIssues = parsed.error.issues;
    repair = artworkValidationDetails(lastIssues, true).slice(0, 12);
  }
  throw new ArtworkValidationError(index + 1, lastIssues);
}
