import { illustrationNames } from '@timotv/contracts';
import { Type, type TSchema } from 'typebox';

const ids = /^[a-zA-Z0-9_-]{1,80}$/;
const pathData = /^[Mm][0-9eE+\-.,\sMmZzLlHhVvCcSsQqTtAa]+$/;
const elementTypes = [
  'illustration',
  'rect',
  'ellipse',
  'path',
  'text',
  'arrow',
  'group',
  'component',
] as const;
const colors = [
  'ink',
  'muted',
  'accent',
  'secondary',
  'paper',
  'panel',
  'warning',
  'none',
] as const;

const literals = <T extends readonly (string | number)[]>(values: T) =>
  Type.Union(values.map((value) => Type.Literal(value)));

const boundedNumber = (minimum: number, maximum: number) =>
  Type.Number({ minimum, maximum });

const object = <T extends Parameters<typeof Type.Object>[0]>(properties: T) =>
  Type.Object(properties, { additionalProperties: false });

/**
 * Provider-facing schema. It is deliberately flatter than the final Zod
 * discriminated union because compatible model APIs enforce simple required
 * fields more reliably than deeply nested oneOf branches.
 */
export function artworkOutputSchema(sceneId: string): TSchema {
  const element = object({
    id: Type.String({ pattern: '^[a-zA-Z0-9_-]{1,80}$' }),
    type: literals(elementTypes),
    x: boundedNumber(0, 1600),
    y: boundedNumber(0, 1600),
    width: boundedNumber(1, 1600),
    height: boundedNumber(1, 1600),
    cueIndex: Type.Integer({ minimum: 0, maximum: 39 }),
    layer: Type.Integer({ minimum: -100, maximum: 100 }),
    parentId: Type.Optional(Type.String({ pattern: '^[a-zA-Z0-9_-]{1,80}$' })),
    transition: Type.Optional(literals(['fade', 'rise', 'draw', 'grow'])),
    fill: Type.Optional(literals(colors)),
    stroke: Type.Optional(literals(colors)),
    strokeWidth: Type.Optional(boundedNumber(0, 12)),
    opacity: Type.Optional(boundedNumber(0, 1)),
    name: Type.Optional(
      literals([...illustrationNames, 'liquid', 'node', 'flow'] as const),
    ),
    radius: Type.Optional(boundedNumber(0, 100)),
    d: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 6000,
        pattern: '^[Mm][0-9eE+\\-.,\\sMmZzLlHhVvCcSsQqTtAa]+$',
      }),
    ),
    text: Type.Optional(Type.String({ minLength: 1, maxLength: 240 })),
    fontSize: Type.Optional(boundedNumber(24, 100)),
    align: Type.Optional(literals(['left', 'center', 'right'])),
    direction: Type.Optional(literals(['right', 'left', 'up', 'down'])),
    state: Type.Optional(literals(['idle', 'active', 'complete'])),
    parameter: Type.Optional(boundedNumber(0, 1)),
  });
  const anchor = object({
    cueId: Type.String({ minLength: 1, maxLength: 80 }),
    progress: Type.Optional(boundedNumber(0, 1)),
    offsetMs: Type.Optional(boundedNumber(-10000, 10000)),
  });
  const motionValue = Type.Union([
    boundedNumber(-10000, 10000),
    Type.String({ minLength: 1, maxLength: 6000 }),
    object({
      x: boundedNumber(-3200, 3200),
      y: boundedNumber(-3200, 3200),
    }),
  ]);
  const track = object({
    elementId: Type.String({ pattern: '^[a-zA-Z0-9_-]{1,80}$' }),
    property: literals([
      'move',
      'scale',
      'rotate',
      'opacity',
      'color',
      'state',
      'path',
      'parameter',
    ]),
    easing: Type.Optional(literals(['linear', 'smooth'])),
    keyframes: Type.Array(object({ at: anchor, value: motionValue }), {
      minItems: 1,
      maxItems: 32,
    }),
  });
  return object({
    sceneId: Type.Literal(sceneId),
    artwork: object({
      version: Type.Literal(2),
      intent: Type.String({ minLength: 1, maxLength: 1000 }),
      elements: Type.Array(element, { minItems: 1, maxItems: 48 }),
      tracks: Type.Array(track, { maxItems: 96 }),
    }),
  });
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Clone and correct only values whose intended meaning is unambiguous. */
export function normalizeArtworkCandidate(value: unknown): unknown {
  if (!record(value) || !record(value.artwork)) return value;
  const artwork = value.artwork;
  if (!Array.isArray(artwork.elements)) return value;
  return {
    ...value,
    artwork: {
      ...artwork,
      elements: artwork.elements.map((element) => {
        if (
          !record(element) ||
          element.type !== 'text' ||
          typeof element.fontSize !== 'number' ||
          !Number.isFinite(element.fontSize)
        )
          return element;
        const fontSize = clamp(element.fontSize, 28, 100);
        return {
          ...element,
          fontSize,
          ...(typeof element.height === 'number' &&
          Number.isFinite(element.height)
            ? { height: Math.max(element.height, Math.ceil(fontSize * 1.2)) }
            : {}),
        };
      }),
    },
  };
}

const numberFields = [
  'x',
  'y',
  'width',
  'height',
  'cueIndex',
  'layer',
  'radius',
  'fontSize',
  'strokeWidth',
  'opacity',
  'parameter',
] as const;
const controlledStrings: Record<string, readonly string[]> = {
  transition: ['fade', 'rise', 'draw', 'grow'],
  fill: colors,
  stroke: colors,
  align: ['left', 'center', 'right'],
  direction: ['right', 'left', 'up', 'down'],
  state: ['idle', 'active', 'complete'],
  name: [...illustrationNames, 'liquid', 'node', 'flow'],
};

/**
 * Produce data-only repair context from an invalid provider candidate. Free
 * text, unknown keys and unsafe path/ID strings never cross into a new prompt.
 */
export function safeArtworkRepairDraft(
  value: unknown,
  expectedSceneId: string,
): unknown | undefined {
  if (
    !record(value) ||
    value.sceneId !== expectedSceneId ||
    !record(value.artwork)
  )
    return;
  const artwork = value.artwork;
  if (
    (artwork.version !== 1 && artwork.version !== 2) ||
    !Array.isArray(artwork.elements) ||
    artwork.elements.length === 0 ||
    artwork.elements.length > 48
  )
    return;
  const elements: Record<string, unknown>[] = [];
  for (const candidate of artwork.elements) {
    if (
      !record(candidate) ||
      typeof candidate.id !== 'string' ||
      !ids.test(candidate.id) ||
      typeof candidate.type !== 'string' ||
      !elementTypes.includes(candidate.type as (typeof elementTypes)[number])
    )
      return;
    if (
      candidate.type === 'path' &&
      candidate.d !== undefined &&
      (typeof candidate.d !== 'string' || !pathData.test(candidate.d))
    )
      return;
    const element: Record<string, unknown> = {
      id: candidate.id,
      type: candidate.type,
    };
    if (typeof candidate.parentId === 'string' && ids.test(candidate.parentId))
      element.parentId = candidate.parentId;
    for (const field of numberFields) {
      const number = candidate[field];
      if (typeof number === 'number' && Number.isFinite(number))
        element[field] = field === 'fontSize' ? clamp(number, 28, 100) : number;
    }
    for (const [field, allowed] of Object.entries(controlledStrings)) {
      const selected = candidate[field];
      if (typeof selected === 'string' && allowed.includes(selected))
        element[field] = selected;
    }
    elements.push(element);
  }
  return {
    sceneId: expectedSceneId,
    artwork: {
      version: artwork.version,
      elements,
      ...(artwork.version === 2 ? { tracks: [] } : {}),
    },
  };
}
