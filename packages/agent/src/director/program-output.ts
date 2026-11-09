import { Type, type TSchema } from 'typebox';

export const drawingComponentIds = [
  'bookshelf',
  'bots',
  'cells',
  'debris',
  'dialog',
  'filetree',
  'flowgraph',
  'fsm',
  'gates',
  'gauges',
  'layers',
  'matrix',
  'messages',
  'meters',
  'notes',
  'pipeline',
  'pointcloud',
  'radar',
  'ranking',
  'receipt',
  'scorecard',
  'segments',
  'sequence',
  'switches',
  'terminal',
  'tower',
  'waffle',
  'warm',
] as const;

const literalUnion = <T extends readonly string[]>(values: T) =>
  Type.Union(values.map((value) => Type.Literal(value)));

export function programArtworkOutputSchema(
  sceneId: string,
  style: string,
): TSchema {
  return Type.Object(
    {
      sceneId: Type.Literal(sceneId),
      artwork: Type.Object(
        {
          version: Type.Literal(3),
          runtime: Type.Literal('timotv-dsl-1'),
          intent: Type.String({ minLength: 1, maxLength: 1000 }),
          source: Type.String({ minLength: 1, maxLength: 100000 }),
          style: Type.Literal(style),
          extras: Type.Array(literalUnion(drawingComponentIds), {
            maxItems: 32,
          }),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  );
}

export function assertSafeProgramSource(sceneId: string, source: string): void {
  const unsafe = () => {
    throw new Error('页面程序包含未允许的能力');
  };
  if (
    !/^[a-zA-Z0-9_-]{1,80}$/.test(sceneId) ||
    !source.trim() ||
    new TextEncoder().encode(source).byteLength > 100_000 ||
    /<\/script/i.test(source)
  )
    unsafe();
  if (
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|Worker|SharedWorker|importScripts|eval|Function|window|document|globalThis|self|parent|top|opener|localStorage|sessionStorage|indexedDB|caches|navigator|location|history|open|postMessage|ENGINE|constructor|__proto__|prototype)\b|\bimport\s*\(/i.test(
      source,
    )
  )
    unsafe();
  if ((source.match(/\bTIMO\s*\.\s*visual\s*\(/g) ?? []).length !== 1) unsafe();
  const escaped = sceneId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (
    !new RegExp(
      `\\bTIMO\\s*\\.\\s*visual\\s*\\(\\s*(['"])${escaped}\\1\\s*,`,
    ).test(source)
  )
    unsafe();
}
