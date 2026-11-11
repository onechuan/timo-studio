import { z } from 'zod';

export const sceneLayoutSchema = z.enum([
  'hero',
  'sequence',
  'comparison',
  'diagram',
  'timeline',
]);
export type SceneLayout = z.infer<typeof sceneLayoutSchema>;
export const sceneLayoutLabels: Record<SceneLayout, string> = {
  hero: '主体特写',
  sequence: '过程演示',
  comparison: '左右对照',
  diagram: '系统关系',
  timeline: '时间推进',
};
export const illustrationNames = [
  'bowl',
  'cup',
  'tree',
  'brain',
  'robot',
  'document',
  'terminal',
  'database',
  'magnifier',
  'globe',
  'calendar',
  'books',
  'person',
  'toolbox',
  'lightbulb',
  'target',
  'cow',
  'cook',
  'worker',
  'cauldron',
  'tofu',
  'factory',
] as const;
export const drawingStyleIds = [
  'blueprint',
  'broadsheet',
  'chalkboard',
  'chat',
  'clay',
  'collage',
  'cosmos',
  'crayon',
  'diorama',
  'engraving',
  'exploded',
  'free',
  'globe',
  'ink-wash',
  'inked',
  'instrument',
  'isometric',
  'isotype',
  'manga',
  'mascot',
  'math',
  'metro',
  'midcentury',
  'molecule',
  'neon',
  'old-map',
  'one-line',
  'papercut',
  'pixel',
  'pop',
  'rubberhose',
  'screencast',
  'shadow-puppet',
  'study',
  'swiss',
  'tech-dark',
  'tutorial',
  'ukiyoe',
  'vector',
  'warm-story',
  'watercolor',
  'whiteboard',
] as const;
export const drawingStyleSchema = z.enum(drawingStyleIds);
export type DrawingStyle = z.infer<typeof drawingStyleSchema>;
export const artworkColorSchema = z.enum([
  'ink',
  'muted',
  'accent',
  'secondary',
  'paper',
  'panel',
  'warning',
  'none',
]);
const common = {
  parentId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,80}$/)
    .optional(),
  layer: z.number().int().min(-100).max(100).optional(),
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  x: z.number().min(0).max(1600),
  y: z.number().min(0).max(1600),
  width: z.number().min(1).max(1600),
  height: z.number().min(1).max(1600),
  cueIndex: z.number().int().min(0).max(39),
  transition: z.enum(['fade', 'rise', 'draw', 'grow']).default('rise'),
  fill: artworkColorSchema.default('accent'),
  stroke: artworkColorSchema.default('none'),
  strokeWidth: z.number().min(0).max(12).default(3),
  opacity: z.number().min(0).max(1).default(1),
};
const legacyElementSchema = z.discriminatedUnion('type', [
  z.object({
    ...common,
    type: z.literal('illustration'),
    name: z.enum(illustrationNames),
  }),
  z.object({
    ...common,
    type: z.literal('rect'),
    radius: z.number().min(0).max(100).default(16),
  }),
  z.object({ ...common, type: z.literal('ellipse') }),
  z.object({
    ...common,
    type: z.literal('path'),
    d: z
      .string()
      .min(1)
      .max(6000)
      .regex(/^[Mm][0-9eE+\-.,\sMmZzLlHhVvCcSsQqTtAa]+$/),
  }),
  z.object({
    ...common,
    type: z.literal('text'),
    text: z.string().trim().min(1).max(240),
    fontSize: z.number().min(24).max(100).default(36),
    align: z.enum(['left', 'center', 'right']).default('left'),
  }),
  z.object({
    ...common,
    type: z.literal('arrow'),
    direction: z.enum(['right', 'left', 'up', 'down']).default('right'),
  }),
]);
export const artworkElementSchema = z.union([
  legacyElementSchema,
  z.object({ ...common, type: z.literal('group') }),
  z.object({
    ...common,
    type: z.literal('component'),
    name: z.enum(['liquid', 'node', 'flow']),
    state: z.enum(['idle', 'active', 'complete']).default('idle'),
    parameter: z.number().min(0).max(1).default(0),
  }),
]);
export const motionAnchorSchema = z.object({
  cueId: z.string().min(1).max(80),
  progress: z.number().min(0).max(1).default(0),
  offsetMs: z.number().min(-10000).max(10000).default(0),
});
const motionValueSchema = z.union([
  z.number().finite().min(-10000).max(10000),
  z.string().min(1).max(6000),
  z.object({
    x: z.number().finite().min(-3200).max(3200),
    y: z.number().finite().min(-3200).max(3200),
  }),
]);
export const motionTrackSchema = z
  .object({
    elementId: z.string().min(1).max(80),
    property: z.enum([
      'move',
      'scale',
      'rotate',
      'opacity',
      'color',
      'state',
      'path',
      'parameter',
    ]),
    easing: z.enum(['linear', 'smooth']).default('linear'),
    keyframes: z
      .array(z.object({ at: motionAnchorSchema, value: motionValueSchema }))
      .min(1)
      .max(32),
  })
  .strict();
/** Restrict morphs to explicit, finite SVG command groups; arcs retain discrete flags. */
export function pathTopology(path: string): string | undefined {
  if (!/^[Mm][0-9eE+\-.,\sMmZzLlHhVvCcSsQqTtAa]+$/.test(path)) return;
  const groups = path.match(/[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*/g);
  if (!groups) return;
  const counts: Record<string, number> = {
    m: 2,
    l: 2,
    h: 1,
    v: 1,
    c: 6,
    s: 4,
    q: 4,
    t: 2,
    a: 7,
    z: 0,
  };
  const shape: string[] = [];
  for (const group of groups) {
    const cmd = group[0]!,
      count = counts[cmd.toLowerCase()]!;
    const rest = group.slice(1),
      numbers = rest.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) ?? [];
    if (
      rest
        .replace(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g, '')
        .replace(/[\s,]/g, '') ||
      numbers.some(
        (n) => !Number.isFinite(Number(n)) || Math.abs(Number(n)) > 100000,
      )
    )
      return;
    if (
      count === 0
        ? numbers.length !== 0
        : numbers.length === 0 || numbers.length % count !== 0
    )
      return;
    if (cmd.toLowerCase() === 'a') {
      for (let i = 0; i < numbers.length; i += 7)
        if (
          !['0', '1'].includes(numbers[i + 3]!) ||
          !['0', '1'].includes(numbers[i + 4]!)
        )
          return;
    }
    shape.push(
      cmd +
        numbers.length +
        (cmd.toLowerCase() === 'a'
          ? numbers.filter((_, i) => i % 7 === 3 || i % 7 === 4).join('')
          : ''),
    );
  }
  return shape.join('|');
}
const artworkV1Schema = z
  .object({
    version: z.literal(1),
    intent: z.string().trim().min(1).max(1000),
    elements: z.array(legacyElementSchema).min(1).max(48),
  })
  .superRefine((value, ctx) => {
    if (new Set(value.elements.map((e) => e.id)).size !== value.elements.length)
      ctx.addIssue({ code: 'custom', message: '绘图对象 ID 重复' });
    if (!value.elements.some((e) => e.cueIndex === 0 && e.opacity > 0))
      ctx.addIssue({ code: 'custom', message: '首句必须有画面' });
  });
export const artworkV2Schema = z
  .object({
    version: z.literal(2),
    intent: z.string().trim().min(1).max(1000),
    elements: z
      .array(
        artworkElementSchema.and(
          z.object({ layer: z.number().int().min(-100).max(100) }),
        ),
      )
      .min(1)
      .max(48),
    tracks: z.array(motionTrackSchema).max(96).default([]),
  })
  .superRefine((v, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: 'custom', message });
    const ids = new Map(v.elements.map((e) => [e.id, e]));
    if (ids.size !== v.elements.length) issue('绘图对象 ID 重复');
    if (
      !v.elements.some(
        (e) => e.cueIndex === 0 && e.type !== 'group' && e.opacity > 0,
      )
    )
      issue('首句必须有画面');
    for (const e of v.elements) {
      const visited = new Set([e.id]);
      let parent = e.parentId;
      while (parent) {
        const p = ids.get(parent);
        if (!p || p.type !== 'group') {
          issue('父对象必须引用分组');
          break;
        }
        if (visited.has(parent)) {
          issue('父子分组不能循环');
          break;
        }
        visited.add(parent);
        parent = p.parentId;
      }
      if (e.type === 'path' && !pathTopology(e.d)) issue('路径指令无效');
      if (e.type === 'component' && (e.width < 24 || e.height < 24))
        issue('组件宽高至少24');
    }
    const firstVisible = v.elements.some((e) => {
      if (e.type === 'group') return false;
      let current: (typeof v.elements)[number] | undefined = e;
      const visited = new Set<string>();
      while (current) {
        if (visited.has(current.id)) return false;
        visited.add(current.id);
        const opacity =
          v.tracks.find(
            (t) => t.elementId === current!.id && t.property === 'opacity',
          )?.keyframes[0]?.value ?? current.opacity;
        if (
          current.cueIndex !== 0 ||
          typeof opacity !== 'number' ||
          opacity <= 0
        )
          return false;
        current = current.parentId ? ids.get(current.parentId) : undefined;
      }
      return true;
    });
    if (!firstVisible) issue('首帧必须有可见主体，父组不可延后或隐藏');
    const seen = new Set<string>();
    for (const track of v.tracks) {
      const e = ids.get(track.elementId),
        key = track.elementId + ':' + track.property;
      if (!e) {
        issue('动画引用不存在的对象');
        continue;
      }
      if (seen.has(key)) issue('对象属性不能有重复轨道');
      seen.add(key);
      for (const k of track.keyframes) {
        const value = k.value,
          p = track.property;
        if (p === 'move' && typeof value !== 'object')
          issue('移动值必须是 x/y');
        if (
          ['scale', 'rotate', 'opacity', 'parameter'].includes(p) &&
          (typeof value !== 'number' ||
            (p === 'scale' && (value <= 0 || value > 10)) ||
            (['opacity', 'parameter'].includes(p) && (value < 0 || value > 1)))
        )
          issue('动画数值超出范围');
        if (p === 'color' && !artworkColorSchema.safeParse(value).success)
          issue('动画颜色无效');
        if (
          p === 'state' &&
          (e.type !== 'component' ||
            !['idle', 'active', 'complete'].includes(String(value)))
        )
          issue('组件状态无效');
        if (p === 'parameter' && e.type !== 'component')
          issue('参数动画需要组件');
        if (
          p === 'path' &&
          (e.type !== 'path' ||
            typeof value !== 'string' ||
            !pathTopology(value) ||
            pathTopology(value) !== pathTopology(e.d))
        )
          issue('路径形变必须保持命令拓扑与弧线标志');
      }
    }
  });
export const sceneProgramV3Schema = z
  .object({
    version: z.literal(3),
    runtime: z.literal('timotv-dsl-1'),
    intent: z.string().trim().min(1).max(1000),
    source: z
      .string()
      .min(1)
      .refine(
        (source) => new TextEncoder().encode(source).byteLength <= 100_000,
        '页面程序不能超过100000字节',
      ),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
    style: drawingStyleSchema,
    extras: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/)).max(32),
  })
  .strict();
const filmKitNameSchema = z.string().regex(/^[a-z][A-Za-z0-9]{1,23}$/);
const filmKitPageIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const filmKitSourceSchema = z
  .string()
  .min(1)
  .refine(
    (source) => new TextEncoder().encode(source).byteLength <= 300_000,
    'Film Kit 源码不能超过300000字节',
  );
const filmKitItemFields = {
  name: filmKitNameSchema,
  what: z.string().trim().min(1).max(300),
  pages: z.array(filmKitPageIdSchema).min(2).max(30),
};
export const filmKitItemSchema = z
  .object(filmKitItemFields)
  .strict()
  .superRefine((item, ctx) => {
    if (new Set(item.pages).size !== item.pages.length)
      ctx.addIssue({ code: 'custom', message: 'Film Kit 页面不能重复' });
  });
export const filmKitComponentResultSchema = z
  .object({
    ...filmKitItemFields,
    status: z.enum([
      'planned',
      'generating',
      'checking',
      'passed',
      'failed',
      'dropped',
    ]),
    source: filmKitSourceSchema.optional(),
    sourceHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    checkSource: filmKitSourceSchema.optional(),
    error: z.string().trim().min(1).max(1000).optional(),
  })
  .strict()
  .superRefine((component, ctx) => {
    if (new Set(component.pages).size !== component.pages.length)
      ctx.addIssue({ code: 'custom', message: 'Film Kit 页面不能重复' });
    if (
      (component.source === undefined) !==
      (component.sourceHash === undefined)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Film Kit 组件源码与哈希必须同时存在',
      });
  });
export const filmKitReviewFrameSchema = z
  .object({
    key: z.string().trim().min(1).max(500),
    timeMs: z.number().int().nonnegative(),
    cueId: filmKitNameSchema.optional(),
  })
  .strict();
export const filmKitReviewIssueSchema = z
  .object({
    component: filmKitNameSchema.optional(),
    kind: z.enum(['layout', 'visual', 'runtime']),
    severity: z.enum(['error', 'warning']),
    atMs: z.number().int().nonnegative(),
    what: z.string().trim().min(1).max(600),
    fix: z.string().trim().min(1).max(1000),
  })
  .strict();
export const filmKitStateSchema = z
  .object({
    status: z.enum([
      'planned',
      'generating',
      'checking',
      'partial',
      'passed',
      'failed',
    ]),
    source: filmKitSourceSchema.optional(),
    sourceHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    components: z.array(filmKitComponentResultSchema).min(1).max(3),
    fingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    frames: z.array(filmKitReviewFrameSchema).max(6).optional(),
    issues: z.array(filmKitReviewIssueSchema).max(12).optional(),
    error: z.string().trim().min(1).max(1000).optional(),
  })
  .strict()
  .superRefine((kit, ctx) => {
    if ((kit.source === undefined) !== (kit.sourceHash === undefined))
      ctx.addIssue({
        code: 'custom',
        message: 'Film Kit 合并源码与哈希必须同时存在',
      });
    if (
      ['checking', 'partial', 'passed'].includes(kit.status) &&
      kit.source === undefined
    )
      ctx.addIssue({
        code: 'custom',
        message: '已生成的 Film Kit 必须保存合并源码',
      });
    if (
      new Set(kit.components.map((item) => item.name)).size !==
      kit.components.length
    )
      ctx.addIssue({ code: 'custom', message: 'Film Kit 组件名称不能重复' });
  });
export const legacyArtworkSchema = z.union([artworkV1Schema, artworkV2Schema]);
export const sceneArtworkSchema = z.union([
  artworkV1Schema,
  artworkV2Schema,
  sceneProgramV3Schema,
]);
export type ArtworkV1 = z.infer<typeof artworkV1Schema>;
export type ArtworkV2 = z.infer<typeof artworkV2Schema>;
export type SceneProgramV3 = z.infer<typeof sceneProgramV3Schema>;
export type FilmKitItem = z.infer<typeof filmKitItemSchema>;
export type FilmKitComponentResult = z.infer<
  typeof filmKitComponentResultSchema
>;
export type FilmKitState = z.infer<typeof filmKitStateSchema>;
export type FilmKitReviewFrame = z.infer<typeof filmKitReviewFrameSchema>;
export type FilmKitReviewIssue = z.infer<typeof filmKitReviewIssueSchema>;
export type MotionTrack = z.infer<typeof motionTrackSchema>;
export interface MotionCue {
  id: string;
  startMs?: number;
  endMs?: number;
}
export function validateArtworkCues(
  artwork: SceneArtwork,
  cues: MotionCue[],
): string[] {
  const issues: string[] = [];
  if (artwork.version === 3) return issues;
  if (artwork.elements.some((e) => e.cueIndex >= cues.length))
    issues.push('对象引用不存在的口播');
  if (artwork.version !== 2) return issues;
  for (const track of artwork.tracks) {
    let previous = -Infinity;
    for (const k of track.keyframes) {
      const cue = cues.find((c) => c.id === k.at.cueId);
      if (!cue || cue.startMs === undefined || cue.endMs === undefined) {
        issues.push('动画引用不存在或未配音的口播');
        continue;
      }
      const t =
        cue.startMs + (cue.endMs - cue.startMs) * k.at.progress + k.at.offsetMs;
      const end = Math.max(...cues.map((c) => c.endMs ?? 0));
      const start = Math.min(...cues.map((c) => c.startMs ?? 0));
      if (!Number.isFinite(t) || t < start || t > end || t <= previous)
        issues.push('关键帧时间必须递增且位于页面时间内');
      previous = t;
    }
  }
  return [...new Set(issues)];
}
export type SceneArtwork = z.infer<typeof sceneArtworkSchema>;
export function isLegacyArtwork(
  artwork: SceneArtwork | undefined,
): artwork is ArtworkV1 | ArtworkV2 {
  return artwork?.version === 1 || artwork?.version === 2;
}
export type ArtworkElement = z.infer<typeof artworkElementSchema>;
export function artworkBounds(aspectRatio: '16:9' | '9:16') {
  return aspectRatio === '16:9'
    ? { width: 1600, height: 900, left: 64, right: 1536, top: 180, bottom: 690 }
    : {
        width: 900,
        height: 1600,
        left: 48,
        right: 852,
        top: 250,
        bottom: 1280,
      };
}
